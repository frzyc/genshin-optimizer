import { objPathValue } from '@genshin-optimizer/common/util'
import type { OptConfig } from '@genshin-optimizer/gi/db'
import type { Data, NumNode } from '@genshin-optimizer/gi/wr'
import { resolveInfo } from '../util'
// Put in gi/ui due to dependency on `resolveInfo`
export function statFilterToNumNode(
  workerData: Data,
  statFilters: OptConfig['statFilters']
): Array<{ value: NumNode; minimum: number }> {
  return Object.entries(statFilters)
    .flatMap(([pathStr, settings]) =>
      settings
        .filter((setting) => !setting.disabled)
        .map((setting) => {
          const filterNode: NumNode = objPathValue(
            workerData.display ?? {},
            JSON.parse(pathStr)
          )
          const infoResolved = filterNode?.info && resolveInfo(filterNode.info)
          const minimum =
            infoResolved?.unit === '%' ? setting.value / 100 : setting.value // TODO: Conversion
          return { value: filterNode, minimum: minimum }
        })
    )
    .filter((x) => x.value && x.minimum > Number.NEGATIVE_INFINITY)
}
