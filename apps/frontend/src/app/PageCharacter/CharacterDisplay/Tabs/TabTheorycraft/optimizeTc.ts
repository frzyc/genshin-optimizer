import type { SubstatKey } from '@genshin-optimizer/consts'
import {
  allSubstatKeys,
  artSubstatRollData,
  type CharacterKey,
} from '@genshin-optimizer/consts'
import { getSubstatValue } from '@genshin-optimizer/gi-util'
import { objMap, toDecimal } from '@genshin-optimizer/util'
import type { TeamData } from '../../../../Context/DataContext'
import { mergeData } from '../../../../Formula/api'
import { mapFormulas } from '../../../../Formula/internal'
import { optimize, precompute } from '../../../../Formula/optimization'
import type { NumNode } from '../../../../Formula/type'
import { constant } from '../../../../Formula/utils'
import type { ICharTC } from '../../../../Types/character'
import { objPathValue, shouldShowDevComponents } from '../../../../Util/Util'
import { dynamicData } from '../TabOptimize/foreground'

// This solves
// $\argmax_{x\in N^k, \sum x <= `distributedSubstats`, x <= `maxSubstats`} `optimizationTarget`(x)$ without assumptions on the properties of `optimizationTarget`
// where $N$ are the natural numbers and $k$ is the number of `SubstatKey`s
// We brute force iterate over all substats in the graph and compute the maximum
// n.b. some substat combinations may not be materializable into real artifacts
export function optimizeTc(
  teamDataProp: TeamData,
  characterKey: CharacterKey,
  charTC: ICharTC
) {
  const startTime = performance.now()
  const {
    artifact: {
      slots,
      substats: { stats: substats, type: substatsType, rarity },
    },
    optimization: {
      target: optimizationTarget,
      distributedSubstats,
      maxSubstats,
      minTotal,
    },
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
  const unoptimizedNodes = [unoptimizedOptimizationTargetNode]
  let nodes = optimize(
    unoptimizedNodes,
    workerData,
    ({ path: [p] }) => p !== 'dyn'
  )
  // Const fold read nodes
  nodes = mapFormulas(
    nodes,
    (f) => {
      if (f.operation === 'read' && f.path[0] === 'dyn') {
        const a = charTC.artifact.sets[f.path[1]]
        if (a) return constant(a)
        if (!(allSubstatKeys as readonly string[]).includes(f.path[1]))
          return constant(0)
      }
      return f
    },
    (f) => f
  )
  nodes = optimize(nodes, {}, (_) => false)

  const subs = new Set<string>()
  const compute = precompute(
    nodes,
    {},
    (f) => {
      const val = f.path[1]
      if (allSubstatKeys.includes(val as SubstatKey)) subs.add(val)
      return val
    },
    2
  )

  const substatValue = (x: string, m: number) =>
    m * getSubstatValue(x as SubstatKey, rarity, substatsType, false)

  let maxBuffer: Record<string, number> = {}
  let maxBufferInt: Record<string, number> = {}
  const scalesWith = [...subs]
  let distributed = distributedSubstats

  //TODO: need to add minTotalRolls to the result returned
  const minTotalRolls = objMap(minTotal, (v, k) => {
    if (!v || !distributed) return 0
    const [node] = optimize([workerData.total[k]], workerData, () => true)
    const diff = v - (node.operation === 'const' ? node.value : 0)
    if (diff <= 0) return 0
    const rolls = Math.ceil(
      diff / getSubstatValue(k, rarity, substatsType, false)
    )
    const disRolls = Math.min(distributed, rolls)
    distributed -= disRolls
    return disRolls
  })

  const existingRolls = objMap(substats, (v, k) =>
    Math.ceil(substats[k] / getSubstatValue(k, rarity, substatsType))
  )
  const maxSubsAssignable = objMap(maxSubstats, (v, k) => v - existingRolls[k])
  let max = -Infinity
  const buffer = {} //Object.fromEntries([...subs].map((x) => [x, 0]))
  const bufferInt: Partial<Record<SubstatKey | 'other', number>> = {} // Object.fromEntries([...subs].map((x) => [x, 0]))
  const existingSubs = objMap(
    charTC.artifact.substats.stats,
    (v, k) => toDecimal(v, k) + minTotalRolls[k]
  )
  const mainStatsCount = getMainStatsCount(slots)
  const minSubLines = getMinSubLines(slots)
  const permute = (toAssign: number, [x, ...xs]: string[]) => {
    if (xs.length === 0) {
      if (toAssign > maxSubsAssignable[x]) return

      if (x !== 'other') buffer[x] = substatValue(x, toAssign)
      bufferInt[x] = toAssign

      const allRolls = allSubstatKeys.map((k) => [
        k,
        (existingSubs[k] ?? 0) + (bufferInt[k] ?? 0),
      ]) as Array<[SubstatKey, number]>
      const minOtherRolls = getMinOtherRolls(
        allRolls,
        mainStatsCount,
        minSubLines
      )
      if ((bufferInt.other ?? 0) < minOtherRolls) return
      const [result] = compute([
        { values: existingSubs },
        { values: buffer },
      ] as const)
      if (result > max) {
        console.log(result)
        max = result
        maxBuffer = structuredClone(buffer)
        maxBufferInt = structuredClone(bufferInt)
      }
      return
    }
    for (let i = 0; i <= Math.min(maxSubsAssignable[x], toAssign); i++) {
      // TODO: Making sure that i + \sum { maxSubstats[xs] } >= distributedSubstats in each recursion will reduce unnecessary recursion considerably for large problems. It will also tighten the possibilities for the leaf recursion, so you don't need so many checkings.
      // https://github.com/frzyc/genshin-optimizer/pull/781#discussion_r1138083742
      buffer[x] = substatValue(x, i)
      bufferInt[x] = i
      permute(toAssign - i, xs)
    }
  }
  permute(distributedSubstats, [...scalesWith, 'other'])
  if (shouldShowDevComponents) {
    console.log(`Took ${performance.now() - startTime} ms`)
    console.log({
      maxBuffer,
      maxBufferInt,
      scalesWith,
    })
  }
  distributed -= maxBufferInt.other
  // }
  return {
    maxBuffer,
    distributed,
    scalesWith,
  }
}
function getMinOtherRolls(
  subsRolls: Array<[SubstatKey, number]>,
  mainStatsCountAgainstSubs: Partial<Record<SubstatKey, number>>,
  minSublines: number = 4 * 5
) {
  const maxSubSlots = subsRolls.reduce((accu, [k, v]) => {
    const maxStatSlot = 5 - (mainStatsCountAgainstSubs[k] ?? 0)
    return accu + Math.min(v, maxStatSlot)
  }, 0)
  return minSublines - maxSubSlots
}

function getMinSubLines(slots: ICharTC['artifact']['slots']) {
  return Object.values(slots).reduce((minSubLines, { rarity, level }) => {
    const { high, low } = artSubstatRollData[rarity]
    return minSubLines + level >= 4 ? high : low
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
