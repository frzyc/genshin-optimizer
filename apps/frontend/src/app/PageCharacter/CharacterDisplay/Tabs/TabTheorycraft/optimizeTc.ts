import type { SubstatKey } from '@genshin-optimizer/consts'
import { allSubstatKeys, type CharacterKey } from '@genshin-optimizer/consts'
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
  // const assignableMaxTot = subsArr.reduce((a, x) => a + maxSubstats[x], 0)
  // if (assignableMaxTot <= distributedSubstats) {
  //   distributed = assignableMaxTot
  //   maxBuffer = Object.fromEntries(
  //     subsArr.map((x) => [x, substatValue(x, maxSubstats[x])])
  //   )
  //   if (shouldShowDevComponents)
  //     console.log({ maxBuffer, subsArr, maxSubstats, distributed })
  // } else {
  let max = -Infinity
  const buffer = {} //Object.fromEntries([...subs].map((x) => [x, 0]))
  const bufferInt = {} // Object.fromEntries([...subs].map((x) => [x, 0]))
  const existingSubs = objMap(
    charTC.artifact.substats.stats,
    (v, k) => toDecimal(v, k) + minTotalRolls[k]
  )
  const allKeys = [...allSubstatKeys, 'other']
  const permute = (toAssign: number, [x, ...xs]: string[]) => {
    if (xs.length === 0) {
      if (toAssign > maxSubsAssignable[x]) return

      if (x !== 'other') buffer[x] = substatValue(x, toAssign)
      bufferInt[x] = toAssign

      const allRolls = allKeys.map((k) => [
        k,
        (existingSubs[k] ?? 0) + (bufferInt[k] ?? 0),
      ]) as Array<[SubstatKey | 'other', number]>
      if (!isValid(allRolls)) return
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

// assumes the rolls respect mainstat max rolls, and max total rolls, and the distribution will be above the min #rolls for rarity
function isValid(subsRolls: Array<[SubstatKey | 'other', number]>) {
  // console.log('isValid')
  // TODO this check can be done before optimizing
  // const minRolls = artSubstatRollData[rarity].low * 5
  // const rolls = entries.reduce((accu, [_, v]) => accu + v, 0)
  // if (rolls < minRolls) {
  //   console.log('rolls < minRolls', { subsRolls, minRolls, rolls })
  //   return false
  // }

  // A "full roll" is basically the minimal amuont of substat slots to satisfy subsRolls
  const rollSlots = subsRolls.reduce(
    (accu, [k, v]) => accu + (k !== 'other' && v ? Math.ceil(v / 6) : 0),
    0
  )
  if (rollSlots) {
    const totalSubSlots = subsRolls.find(([k]) => k === 'other')[1] + rollSlots
    if (totalSubSlots < 4 * 5) {
      // console.log('rollsSmallerThan6 < expectedOtherRolls', {
      //   rollsSmallerThan6,
      //   expectedOtherRolls,
      // })
      return false
    }
  }
  return true
}
