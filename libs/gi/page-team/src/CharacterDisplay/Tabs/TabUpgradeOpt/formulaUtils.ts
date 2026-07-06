import {
  type ArtifactSlotKey,
  allArtifactSetKeys,
} from '@genshin-optimizer/gi/consts'
import type { ICachedArtifact } from '@genshin-optimizer/gi/db'
import type { DynStat } from '@genshin-optimizer/gi/solver'
import { type OptNode, mapFormulas } from '@genshin-optimizer/gi/wr'

/**
 * Given a build and at most 1 replacement artifact, remove all the threshold(setKey) nodes that are always active/inactive.
 * @param nodes
 * @param build
 * @returns
 */
export function removeSetKeys(
  nodes: OptNode[],
  build: Record<ArtifactSlotKey, ICachedArtifact | undefined>
) {
  const setKeysInBuild = {} as DynStat
  Object.values(build).forEach((art) => {
    if (!art) return
    setKeysInBuild[art.setKey] = (setKeysInBuild[art.setKey] ?? 0) + 1
  })

  nodes = mapFormulas(
    nodes,
    (_) => _,
    (f) => {
      if (f.operation !== 'threshold') return f
      const [cond, cmp, pass, fail] = f.operands
      if (cond.operation !== 'read' || cmp.operation !== 'const') return f

      const setKey = cond.path[1]
      if (!allArtifactSetKeys.includes(setKey as any)) return f

      const skCount = setKeysInBuild[setKey] ?? 0
      if (skCount + 1 < cmp.value) return fail
      if (skCount - 1 >= cmp.value) return pass
      return f
    }
  )

  return nodes
}
