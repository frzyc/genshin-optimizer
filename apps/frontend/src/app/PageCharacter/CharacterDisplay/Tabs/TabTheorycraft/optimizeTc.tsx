import type { ArtifactSetKey, CharacterKey } from '@genshin-optimizer/consts'
import { allArtifactSetKeys } from '@genshin-optimizer/consts'
import Artifact from '../../../../Data/Artifacts/Artifact'
import type { ArtCharDatabase } from '../../../../Database/Database'
import { mergeData, uiDataForTeam } from '../../../../Formula/api'
import { mapFormulas } from '../../../../Formula/internal'
import { optimize, precompute } from '../../../../Formula/optimization'
import type { NumNode } from '../../../../Formula/type'
import { constant } from '../../../../Formula/utils'
import { getTeamData } from '../../../../ReactHooks/useTeamData'
import type { SubstatKey } from '../../../../Types/artifact'
import { allSubstatKeys } from '../../../../Types/artifact'
import type { ICharTC } from '../../../../Types/character'
import type { Gender } from '../../../../Types/consts'
import type { ICachedWeapon } from '../../../../Types/weapon'
import { deepClone, objectMap, objPathValue } from '../../../../Util/Util'
import { dynamicData } from '../TabOptimize/foreground'
import type { SetCharTCAction } from '.'

export function optimizeTc(
  characterKey: CharacterKey,
  optimizationTarget: string[] | undefined,
  database: ArtCharDatabase,
  overriderArtData: {
    art: Record<SubstatKey, NumNode>
    artSet: Partial<Record<ArtifactSetKey, NumNode>>
  },
  overrideWeapon: ICachedWeapon,
  gender: Gender,
  charTC: ICharTC,
  maxSubstats: Record<SubstatKey, number>,
  distributedSubstats: number,
  apply: boolean,
  setCharTC: (data: SetCharTCAction) => void
): () => void {
  return () => {
    const startTime = performance.now()
    if (!characterKey || !optimizationTarget) return
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
    // Const fold the artifact set
    nodes = mapFormulas(
      nodes,
      (f) => {
        if (f.operation === 'read' && f.path[0] === 'dyn') {
          const a = charTC.artifact.sets[f.path[1]]
          if (a) {
            return constant(a)
          } else if (allArtifactSetKeys.includes(f.path[1] as any)) {
            return constant(0)
          }
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
    const realSubs = [...subs].filter((x) => allSubstatKeys.includes(x as any))
    if (realSubs.reduce((p, x) => p + maxSubstats[x], 0) < distributedSubstats)
      realSubs.push('__unused__')
    const comp = (statKey: string) => (statKey.endsWith('_') ? 100 : 1)

    let max = -Infinity
    const buffer = Object.fromEntries([...subs].map((x) => [x, 0]))
    let maxBuffer: typeof buffer | undefined
    const bufferSubs = objectMap(
      charTC.artifact.substats.stats,
      (v, k) => v / comp(k)
    )
    const permute = (distributedSubstats: number, [x, ...xs]: string[]) => {
      if (xs.length === 0) {
        if (distributedSubstats > maxSubstats[x]) return
        if (x !== '__unused__')
          buffer[x] =
            (Artifact.substatValue(
              x as SubstatKey,
              5,
              charTC.artifact.substats.type
            ) /
              comp(x)) *
            distributedSubstats
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
      for (let i = 0; i <= Math.min(maxSubstats[x], distributedSubstats); i++) {
        buffer[x] =
          (Artifact.substatValue(
            x as SubstatKey,
            5,
            charTC.artifact.substats.type
          ) /
            comp(x)) *
          i
        permute(distributedSubstats - i, xs)
      }
    }
    permute(distributedSubstats, realSubs)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Took ${performance.now() - startTime} ms`)
      console.log(maxBuffer)
      console.log(
        objectMap(maxBuffer!, (v, x) =>
          allSubstatKeys.includes(x as any)
            ? v /
              (Artifact.substatValue(
                x as SubstatKey,
                5,
                charTC.artifact.substats.type
              ) /
                comp(x))
            : v
        )
      )
    }

    if (apply) {
      const data_ = deepClone(charTC)
      data_.artifact.substats.stats = objectMap(
        charTC.artifact.substats.stats,
        (v, k) => v + (maxBuffer![k] ?? 0) * comp(k)
      )
      data_.optimization.distributedSubstats = 0
      setCharTC(data_)
    }
  }
}
