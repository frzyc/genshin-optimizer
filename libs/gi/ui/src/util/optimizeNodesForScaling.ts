import { objPathValue } from '@genshin-optimizer/common/util'
import type { MainSubStatKey } from '@genshin-optimizer/gi/consts'
import {
  allMainSubStatKeys,
  type CharacterKey,
} from '@genshin-optimizer/gi/consts'
import type { OptConfig } from '@genshin-optimizer/gi/db'
import type { NumNode } from '@genshin-optimizer/gi/wr'
import {
  constant,
  dynamicData,
  mapFormulas,
  mergeData,
  optimize,
} from '@genshin-optimizer/gi/wr'
import type { TeamData } from '../type'
import { statFilterToNumNode } from './statFilterToNumNode'
export function optimizeNodesForScaling(
  teamDataProp: TeamData,
  characterKey: CharacterKey,
  optimizationTarget: OptConfig['optimizationTarget'],
  statFilters: OptConfig['statFilters']
) {
  if (!optimizationTarget) return {}
  const workerData = teamDataProp[characterKey]?.target.data![0]
  if (!workerData) return {}
  const unoptimizedOptimizationTargetNode = objPathValue(
    workerData.display ?? {},
    optimizationTarget
  ) as NumNode | undefined
  if (!unoptimizedOptimizationTargetNode) return {}

  Object.assign(workerData, mergeData([workerData, dynamicData])) // Mark art fields as dynamic

  const valueFilter = statFilterToNumNode(workerData, statFilters)

  const unoptimizedNodes = [
    unoptimizedOptimizationTargetNode,
    ...valueFilter.map((x) => x.value),
  ]

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
        // const a = artSets[f.path[1]]
        // if (a) return constant(a)
        const stat = f.path[1]
        if (!allMainSubStatKeys.includes(stat as MainSubStatKey))
          return constant(0)
      }
      return f
    },
    (f) => f
  )
  nodes = optimize(nodes, {}, (_) => false)
  return { nodes, valueFilter }
}
