import { objMap } from '@genshin-optimizer/common/util'
import type { SubstatKey } from '@genshin-optimizer/gi/consts'
import {
  allSubstatKeys,
  artSubstatRollData,
} from '@genshin-optimizer/gi/consts'
import type { BuildTc } from '@genshin-optimizer/gi/db'
import { getSubstatValue } from '@genshin-optimizer/gi/util'
import type { NumNode, OptNode } from '@genshin-optimizer/gi/wr'
import { precompute } from '@genshin-optimizer/gi/wr'

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

export function getMinSubAndOtherRolls(charTC: BuildTc) {
  const {
    artifact: {
      slots,
      substats: { stats: substats, type: substatsType, rarity },
    },
  } = charTC
  const existingRolls = objMap(substats, (v, k) =>
    Math.ceil(substats[k] / getSubstatValue(k, rarity, substatsType)),
  )
  const mainStatsCount = getMainStatsCount(slots)
  const minSubLines = getMinSubLines(slots)
  return {
    minSubLines,
    minOtherRolls: getMinOtherRolls(
      Object.entries(existingRolls) as Array<[SubstatKey, number]>,
      mainStatsCount,
      minSubLines,
    ),
  }
}

export function optimizeTcUsingNodes(
  nodes: OptNode[],
  valueFilter: Array<{ value: NumNode; minimum: number }>,
  charTC: BuildTc,
  callback: (r: TCWorkerResult) => void,
  debug = false,
) {
  const startTime = performance.now()
  const {
    artifact: {
      slots,
      substats: { stats: substats, type: substatsType, rarity },
    },
    optimization: { distributedSubstats, maxSubstats },
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
    1,
  )

  const substatValue = (x: string, m: number) =>
    m * getSubstatValue(x as SubstatKey, rarity, substatsType, false)

  const scalesWithSub = [...scalesWith].filter((k) =>
    allSubstatKeys.includes(k as SubstatKey),
  )

  const existingRolls = objMap(substats, (v, k) =>
    Math.ceil(substats[k] / getSubstatValue(k, rarity, substatsType)),
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
      Object.entries(existingRolls) as Array<[SubstatKey, number]>,
      mainStatsCount,
      minSubLines,
    ) <= 0

  callback({
    resultType: 'total',
    total: countPerms(
      distributedSubstats,
      [...scalesWithSub, 'other'].map((k) =>
        k === 'other' ? distributedSubstats : maxSubsAssignable[k],
      ),
    ),
  })
  let tested = 0
  let failed = 0
  let skipped = 0
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
      if (valueFilter.some((c, i) => results[i + 1] < c.minimum)) {
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
          minSubLines,
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
  if (debug) {
    console.log(`Took ${performance.now() - startTime} ms`)
    console.log({
      maxBuffer,
      maxBufferRolls,
      scalesWith,
    })
  }
  const distributed = Object.entries(maxBufferRolls).reduce(
    (accu, [k, v]) => accu + (k === 'other' ? 0 : v),
    0,
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
  minSublines: number = 4 * 5,
) {
  const maxSubSlots = subsRolls.reduce((accu, [k, v]) => {
    const maxStatSlot = 5 - (mainStatsCount[k] ?? 0)
    return accu + Math.min(v, maxStatSlot)
  }, 0)
  return minSublines - maxSubSlots
}

function getMinSubLines(slots: BuildTc['artifact']['slots']) {
  return Object.values(slots).reduce((minSubLines, { rarity, level }) => {
    const { high, low } = artSubstatRollData[rarity]
    return minSubLines + (level >= 4 ? high : low)
  }, 0)
}
function getMainStatsCount(slots: BuildTc['artifact']['slots']) {
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
