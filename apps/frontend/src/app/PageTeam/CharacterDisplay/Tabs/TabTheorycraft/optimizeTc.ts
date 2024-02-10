import { objMap, toDecimal } from '@genshin-optimizer/common/util'
import type { SubstatKey } from '@genshin-optimizer/gi/consts'
import {
  allSubstatKeys,
  artSubstatRollData,
  type CharacterKey,
} from '@genshin-optimizer/gi/consts'
import type { ICachedWeapon, ICharTC } from '@genshin-optimizer/gi/db'
import { getMainStatValue, getSubstatValue } from '@genshin-optimizer/gi/util'
import type { TeamData } from '../../../../Context/DataContext'
import { mergeData } from '../../../../Formula/api'
import { mapFormulas } from '../../../../Formula/internal'
import type { OptNode } from '../../../../Formula/optimization'
import { optimize, precompute } from '../../../../Formula/optimization'
import type { Data, NumNode } from '../../../../Formula/type'
import { constant, percent } from '../../../../Formula/utils'
import { objPathValue, shouldShowDevComponents } from '../../../../Util/Util'
import { dynamicData } from '../TabOptimize/foreground'

export type TCWorkerResult = TotalResult | CountResult | FinalizeResult

export interface TotalResult {
  resultType: 'total'
  total: number
}
export interface CountResult {
  resultType: 'count'
  tested: number // tested, including `failed`
  failed: number // tested but fail the filter criteria, e.g., not enough EM
  skipped: number // failed feasibility check
}

export interface FinalizeResult {
  resultType: 'finalize'
  maxBuffer: Partial<Record<SubstatKey, number>>
  maxBufferRolls: Partial<Record<SubstatKey, number>>
  distributed: number
  tested: number
  failed: number
  skipped: number
}

// This solves
// $\argmax_{x\in N^k, \sum x <= `distributedSubstats`, x <= `maxSubstats`} `optimizationTarget`(x)$ without assumptions on the properties of `optimizationTarget`
// where $N$ are the natural numbers and $k$ is the number of `SubstatKey`s
// We brute force iterate over all substats in the graph and compute the maximum
// n.b. some substat combinations may not be materializable into real artifacts
export function optimizeTcGetNodes(
  teamDataProp: TeamData,
  characterKey: CharacterKey,
  charTC: ICharTC
) {
  const {
    artifact: { sets: artSets },
    optimization: { target: optimizationTarget, minTotal },
  } = charTC
  if (!optimizationTarget) return {}
  const workerData = teamDataProp[characterKey]?.target.data![0]
  if (!workerData) return {}
  // TODO: It may be better to use different dynamic data and add extra nodes to workerData during optimize so that you don't need to re-constant fold artifact set nodes later.
  // https://github.com/frzyc/genshin-optimizer/pull/781#discussion_r1138023281
  Object.assign(workerData, mergeData([workerData, dynamicData])) // Mark art fields as dynamic
  const unoptimizedOptimizationTargetNode = objPathValue(
    workerData.display ?? {},
    optimizationTarget
  ) as NumNode | undefined
  if (!unoptimizedOptimizationTargetNode) return {}

  const constraints = Object.keys(minTotal).map((k) => workerData.total[k])

  let nodes = optimize(
    [unoptimizedOptimizationTargetNode, ...constraints],
    workerData,
    ({ path: [p] }) => p !== 'dyn'
  )
  // Const fold read nodes
  nodes = mapFormulas(
    nodes,
    (f) => {
      if (f.operation === 'read' && f.path[0] === 'dyn') {
        const a = artSets[f.path[1]]
        if (a) return constant(a)
        if (!(allSubstatKeys as readonly string[]).includes(f.path[1]))
          return constant(0)
      }
      return f
    },
    (f) => f
  )
  nodes = optimize(nodes, {}, (_) => false)
  return {
    nodes,
  }
}

export function getScalesWith(nodes: OptNode[]) {
  const scalesWith = new Set<string>()
  precompute(
    nodes,
    {},
    (f) => {
      const val = f.path[1]
      scalesWith.add(val)
      return val
    },
    1
  )
  return scalesWith as Set<SubstatKey>
}

export function getMinSubAndOtherRolls(charTC: ICharTC) {
  const {
    artifact: {
      slots,
      substats: { stats: substats, type: substatsType, rarity },
    },
  } = charTC
  const existingRolls = objMap(substats, (v, k) =>
    Math.ceil(substats[k] / getSubstatValue(k, rarity, substatsType))
  )
  const mainStatsCount = getMainStatsCount(slots)
  const minSubLines = getMinSubLines(slots)
  return {
    minSubLines,
    minOtherRolls: getMinOtherRolls(
      Object.entries(existingRolls),
      mainStatsCount,
      minSubLines
    ),
  }
}

export function optimizeTcUsingNodes(
  nodes: OptNode[],
  charTC: ICharTC,
  callback: (r: TCWorkerResult) => void
) {
  const startTime = performance.now()
  const {
    artifact: {
      slots,
      substats: { stats: substats, type: substatsType, rarity },
    },
    optimization: { distributedSubstats, maxSubstats, minTotal },
  } = charTC

  const scalesWith = new Set<string>()
  const compute = precompute(
    nodes,
    {},
    (f) => {
      const val = f.path[1]
      scalesWith.add(val)
      return val
    },
    1
  )

  const substatValue = (x: string, m: number) =>
    m * getSubstatValue(x as SubstatKey, rarity, substatsType, false)

  const scalesWithSub = [...scalesWith].filter((k) =>
    allSubstatKeys.includes(k as SubstatKey)
  )

  const existingRolls = objMap(substats, (v, k) =>
    Math.ceil(substats[k] / getSubstatValue(k, rarity, substatsType))
  )
  const maxSubsAssignable = objMap(maxSubstats, (v, k) => v - existingRolls[k])
  let max = -Infinity
  const buffer: Record<string, number> = {} //Object.fromEntries([...subs].map((x) => [x, 0]))
  const bufferRolls: Partial<Record<SubstatKey | 'other', number>> = {
    other: 0,
  } // Object.fromEntries([...subs].map((x) => [x, 0]))
  let maxBuffer: Record<string, number> = structuredClone(buffer)
  let maxBufferRolls: Partial<Record<SubstatKey | 'other', number>> =
    structuredClone(bufferRolls)
  const mainStatsCount = getMainStatsCount(slots)
  const minSubLines = getMinSubLines(slots)

  const alreadyFeasible =
    getMinOtherRolls(
      Object.entries(existingRolls),
      mainStatsCount,
      minSubLines
    ) <= 0

  callback({
    resultType: 'total',
    total: countPerms(
      distributedSubstats,
      [...scalesWithSub, 'other'].map((k) =>
        k === 'other' ? distributedSubstats : maxSubsAssignable[k]
      )
    ),
  })
  let tested = 0
  let failed = 0
  let skipped = 0
  const constraints = Object.entries(minTotal).map(([k, v]) => toDecimal(v, k))
  const permute = (toAssign: number, [x, ...xs]: string[]) => {
    if (xs.length === 0) {
      if (toAssign > maxSubsAssignable[x]) return
      tested++
      if (!(tested % 100_000))
        callback({
          resultType: 'count',
          tested,
          failed,
          skipped,
        })
      if (x !== 'other') buffer[x] = substatValue(x, toAssign)
      bufferRolls[x] = toAssign
      const results = compute([{ values: buffer }] as const)
      const result = results[0]
      if (result <= max) {
        return
      }
      // check constraints
      if (constraints.some((c, i) => results[i + 1] < c)) {
        failed++
        return
      }
      if (!alreadyFeasible) {
        //check for distributed feasibility
        const allRolls = allSubstatKeys.map((k) => [
          k,
          (existingRolls[k] ?? 0) + (bufferRolls[k] ?? 0),
        ]) as Array<[SubstatKey, number]>
        const minOtherRolls = getMinOtherRolls(
          allRolls,
          mainStatsCount,
          minSubLines
        )
        // not feasible
        if ((bufferRolls.other ?? 0) < minOtherRolls) {
          skipped++
          return
        }
      }
      max = result
      maxBuffer = structuredClone(buffer)
      maxBufferRolls = structuredClone(bufferRolls)
    }
    for (let i = 0; i <= Math.min(maxSubsAssignable[x], toAssign); i++) {
      // TODO: Making sure that i + \sum { maxSubstats[xs] } >= distributedSubstats in each recursion will reduce unnecessary recursion considerably for large problems. It will also tighten the possibilities for the leaf recursion, so you don't need so many checkings.
      // https://github.com/frzyc/genshin-optimizer/pull/781#discussion_r1138083742
      buffer[x] = substatValue(x, i)
      bufferRolls[x] = i
      permute(toAssign - i, xs)
    }
  }
  permute(distributedSubstats, [...scalesWithSub, 'other'])
  if (shouldShowDevComponents) {
    console.log(`Took ${performance.now() - startTime} ms`)
    console.log({
      maxBuffer,
      maxBufferRolls,
      scalesWith,
    })
  }
  const distributed = Object.entries(maxBufferRolls).reduce(
    (accu, [k, v]) => accu + (k === 'other' ? 0 : v),
    0
  )
  callback({
    resultType: 'finalize',
    distributed,
    maxBufferRolls,
    maxBuffer,
    tested,
    failed,
    skipped,
  })
  // return {
  //   maxBuffer,
  //   distributed,
  //   scalesWith,
  // }
}

function getMinOtherRolls(
  subsRolls: Array<[SubstatKey, number]>,
  mainStatsCount: Partial<Record<SubstatKey, number>>,
  minSublines: number = 4 * 5
) {
  const maxSubSlots = subsRolls.reduce((accu, [k, v]) => {
    const maxStatSlot = 5 - (mainStatsCount[k] ?? 0)
    return accu + Math.min(v, maxStatSlot)
  }, 0)
  return minSublines - maxSubSlots
}

function getMinSubLines(slots: ICharTC['artifact']['slots']) {
  return Object.values(slots).reduce((minSubLines, { rarity, level }) => {
    const { high, low } = artSubstatRollData[rarity]
    return minSubLines + (level >= 4 ? high : low)
  }, 0)
}
function getMainStatsCount(slots: ICharTC['artifact']['slots']) {
  const mainStatsCount: Partial<Record<SubstatKey, number>> = {}

  Object.values(slots).forEach(({ statKey }) => {
    mainStatsCount[statKey as SubstatKey] =
      (mainStatsCount[statKey as SubstatKey] ?? 0) + 1
  }, 0)
  return mainStatsCount
}
// Count the number of integer solutions of `a_0 + a_1 + ... + a_(N-1) == sum` (where `N == bounds.length`) such that `0 <= a_i <= bounds[i]`
function countPerms(sum: number, bounds: number[]): number {
  // counts[s] = the number of ways to sum to `s`
  let counts = Array(sum + 1).fill(0)
  counts[0] = 1
  for (const bound of bounds) {
    const new_counts = Array(sum + 1).fill(0)
    for (let a_i = 0; a_i <= bound; a_i++) {
      for (let s = a_i; s <= sum; s++) {
        new_counts[s] += counts[s - a_i]
      }
    }
    counts = new_counts
  }
  return counts[sum]
}

export function getArtifactData(charTC: ICharTC): Data {
  const {
    artifact: {
      slots,
      substats: { stats: substats },
      sets,
    },
  } = charTC
  const allStats = objMap(substats, (v, k) => toDecimal(v, k))
  Object.values(slots).forEach(
    ({ statKey, rarity, level }) =>
      (allStats[statKey] =
        (allStats[statKey] ?? 0) + getMainStatValue(statKey, rarity, level))
  )
  return {
    art: objMap(allStats, (v, k) =>
      k.endsWith('_') ? percent(v) : constant(v)
    ),
    artSet: objMap(sets, (v) => constant(v)),
  }
}

export function getWeaponData(charTC: ICharTC): ICachedWeapon {
  const {
    weapon: { key, level, ascension, refinement },
  } = charTC
  return {
    id: '',
    location: '',
    key,
    level,
    ascension,
    refinement,
    lock: false,
  }
}
