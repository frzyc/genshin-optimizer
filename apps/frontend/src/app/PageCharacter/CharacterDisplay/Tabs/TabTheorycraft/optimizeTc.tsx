import type { GenderKey, SubstatKey } from '@genshin-optimizer/consts'
import {
  allSubstatKeys,
  type ArtifactSetKey,
  type CharacterKey,
} from '@genshin-optimizer/consts'
import { getSubstatValue } from '@genshin-optimizer/gi-util'
import { objMap } from '@genshin-optimizer/util'
import type { SetCharTCAction } from '.'
import type { ArtCharDatabase } from '../../../../Database/Database'
import { mergeData, uiDataForTeam } from '../../../../Formula/api'
import { mapFormulas } from '../../../../Formula/internal'
import { optimize, precompute } from '../../../../Formula/optimization'
import type { NumNode } from '../../../../Formula/type'
import { constant } from '../../../../Formula/utils'
import { getTeamData } from '../../../../ReactHooks/useTeamData'
import type { ICharTC } from '../../../../Types/character'
import type { ICachedWeapon } from '../../../../Types/weapon'
import { objPathValue, objectMap } from '../../../../Util/Util'
import { dynamicData } from '../TabOptimize/foreground'

// This solves
// $\argmax_{x\in N^k, \sum x <= `distributedSubstats`, x <= `maxSubstats`} `optimizationTarget`(x)$ without assumptions on the properties of `optimizationTarget`
// where $N$ are the natural numbers and $k$ is the number of `SubstatKey`s
// We brute force iterate over all substats in the graph and compute the maximum
// n.b. some substat combinations may not be materializable into real artifacts
export function optimizeTc(
  characterKey: CharacterKey,
  optimizationTarget: string[] | undefined,
  database: ArtCharDatabase,
  overriderArtData: {
    art: Record<SubstatKey, NumNode>
    artSet: Partial<Record<ArtifactSetKey, NumNode>>
  },
  overrideWeapon: ICachedWeapon,
  gender: GenderKey,
  charTC: ICharTC,
  maxSubstats: Record<SubstatKey, number>,
  distributedSubstats: number,
  apply: boolean,
  setCharTC: (data: SetCharTCAction) => void
): () => void {
  return () => {
    const startTime = performance.now()
    if (!optimizationTarget) return
    const teamData = getTeamData(
      database,
      characterKey,
      0,
      overriderArtData,
      overrideWeapon
    )
    if (!teamData) return
    const workerData = uiDataForTeam(teamData.teamData, gender, characterKey)[
      characterKey
    ]?.target.data![0]
    if (!workerData) return
    // TODO: It may be better to use different dynamic data and add extra nodes to workerData during optimize so that you don't need to re-constant fold artifact set nodes later.
    // https://github.com/frzyc/genshin-optimizer/pull/781#discussion_r1138023281
    Object.assign(workerData, mergeData([workerData, dynamicData])) // Mark art fields as dynamic
    const unoptimizedOptimizationTargetNode = objPathValue(
      workerData.display ?? {},
      optimizationTarget
    ) as NumNode | undefined
    if (!unoptimizedOptimizationTargetNode) return
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
      (getSubstatValue(x as SubstatKey, 5, charTC.artifact.substats.type) /
        comp(x)) *
      m

    let maxBuffer: Record<string, number> = Object.fromEntries(
      [...subs].map((x) => [x, 0])
    )
    const subsArr = [...subs]
    if (
      subsArr.reduce((a, x) => a + maxSubstats[x], 0) <= distributedSubstats
    ) {
      maxBuffer = Object.fromEntries(
        subsArr.map((x) => [x, substatValue(x, maxSubstats[x])])
      )
      if (process.env.NODE_ENV === 'development') console.log(maxBuffer)
    } else {
      let max = -Infinity
      const buffer = Object.fromEntries([...subs].map((x) => [x, 0]))
      const bufferSubs = objectMap(
        charTC.artifact.substats.stats,
        (v, k) => v / comp(k)
      )
      const permute = (distributedSubstats: number, [x, ...xs]: string[]) => {
        if (xs.length === 0) {
          if (distributedSubstats > maxSubstats[x]) return
          const [result] = compute([
            { values: bufferSubs },
            { values: buffer },
          ] as const)
          if (result > max) {
            max = result
            maxBuffer = structuredClone(buffer)
          }
          return
        }
        for (
          let i = 0;
          i <= Math.min(maxSubstats[x], distributedSubstats);
          i++
        ) {
          // TODO: Making sure that i + \sum { maxSubstats[xs] } >= distributedSubstats in each recursion will reduce unnecessary recursion considerably for large problems. It will also tighten the possibilities for the leaf recursion, so you don't need so many checkings.
          // https://github.com/frzyc/genshin-optimizer/pull/781#discussion_r1138083742
          buffer[x] = substatValue(x, i)
          permute(distributedSubstats - i, xs)
        }
      }
      permute(distributedSubstats, subsArr)
      if (process.env.NODE_ENV === 'development') {
        console.log(`Took ${performance.now() - startTime} ms`)
        console.log(maxBuffer)
        console.log(
          objMap(maxBuffer!, (v, x) =>
            allSubstatKeys.includes(x as any)
              ? v /
                (getSubstatValue(
                  x as SubstatKey,
                  5,
                  charTC.artifact.substats.type
                ) /
                  comp(x))
              : v
          )
        )
      }
    }

    if (apply) {
      const data_ = structuredClone(charTC)
      data_.artifact.substats.stats = objectMap(
        charTC.artifact.substats.stats,
        (v, k) => v + (maxBuffer![k] ?? 0) * comp(k)
      )
      data_.optimization.distributedSubstats = 0
      setCharTC(data_)
    }
  }
}
