import { objPathValue } from '@genshin-optimizer/common/util'
import type { MainSubStatKey } from '@genshin-optimizer/gi/consts'
import {
  type CharacterKey,
  allMainSubStatKeys,
} from '@genshin-optimizer/gi/consts'
import type { OptConfig } from '@genshin-optimizer/gi/db'
import type { NumNode } from '@genshin-optimizer/gi/wr'
import { dynamicData, mergeData, optimize } from '@genshin-optimizer/gi/wr'
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

  const nodes = optimize(
    unoptimizedNodes,
    workerData,
    ({ path: [p, stat] }) =>
      p !== 'dyn' || !allMainSubStatKeys.includes(stat as MainSubStatKey)
  )
  return { nodes, valueFilter }
}
