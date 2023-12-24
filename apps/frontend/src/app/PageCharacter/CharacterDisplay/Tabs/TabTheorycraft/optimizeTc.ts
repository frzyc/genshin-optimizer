import type { SubstatKey } from '@genshin-optimizer/consts'
import { allSubstatKeys, type CharacterKey } from '@genshin-optimizer/consts'
import { getSubstatValue } from '@genshin-optimizer/gi-util'
import { objMap } from '@genshin-optimizer/util'
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
    target: optimizationTarget,
    distributedSubstats,
    maxSubstats,
  } = charTC.optimization
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
        if (!allSubstatKeys.includes(f.path[1] as any)) return constant(0)
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
      subs.add(f.path[1])
      return f.path[1]
    },
    2
  )

  const comp = (statKey: string) => (statKey.endsWith('_') ? 100 : 1)
  const substatValue = (x: string, m: number) =>
    m *
    getSubstatValue(x as SubstatKey, 5, charTC.artifact.substats.type, false)

  let maxBuffer: Record<string, number> = Object.fromEntries(
    [...subs].map((x) => [x, 0])
  )
  const subsArr = [...subs]
  let distributed = distributedSubstats
  const assignableMaxTot = subsArr.reduce((a, x) => a + maxSubstats[x], 0)
  if (assignableMaxTot <= distributedSubstats) {
    distributed = assignableMaxTot
    maxBuffer = Object.fromEntries(
      subsArr.map((x) => [x, substatValue(x, maxSubstats[x])])
    )
    if (shouldShowDevComponents)
      console.log({ maxBuffer, subsArr, maxSubstats, distributed })
  } else {
    let max = -Infinity
    const buffer = Object.fromEntries([...subs].map((x) => [x, 0]))
    const existingSubs = objMap(
      charTC.artifact.substats.stats,
      (v, k) => v / comp(k)
    )
    const permute = (toAssign: number, [x, ...xs]: string[]) => {
      if (xs.length === 0) {
        if (toAssign > maxSubstats[x]) return
        buffer[x] = substatValue(x, toAssign)
        const [result] = compute([
          { values: existingSubs },
          { values: buffer },
        ] as const)
        if (result > max) {
          max = result
          maxBuffer = structuredClone(buffer)
        }
        return
      }
      for (let i = 0; i <= Math.min(maxSubstats[x], toAssign); i++) {
        // TODO: Making sure that i + \sum { maxSubstats[xs] } >= distributedSubstats in each recursion will reduce unnecessary recursion considerably for large problems. It will also tighten the possibilities for the leaf recursion, so you don't need so many checkings.
        // https://github.com/frzyc/genshin-optimizer/pull/781#discussion_r1138083742
        buffer[x] = substatValue(x, i)
        permute(toAssign - i, xs)
      }
    }
    permute(distributedSubstats, subsArr)
    if (shouldShowDevComponents) {
      console.log(`Took ${performance.now() - startTime} ms`)
      console.log({
        maxBuffer,
        maxBufferInt: objMap(
          maxBuffer,
          (v, k) =>
            v /
            getSubstatValue(
              k as SubstatKey,
              5,
              charTC.artifact.substats.type,
              false
            )
        ),
        subsArr,
      })
    }
  }
  return { maxBuffer, distributed }
}
