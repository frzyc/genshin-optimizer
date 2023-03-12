import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import { inferInfoMut, mergeData } from '../../Formula/api'
import type { Data, DisplaySub } from '../../Formula/type'

export function dataObjForArtifactSheet(
  key: ArtifactSetKey,
  data: Data = {},
  displayArtifact: DisplaySub = {}
): Data {
  return mergeData([
    inferInfoMut(data, key),
    {
      display: {
        [`artifact:${key}`]: displayArtifact,
      },
    },
  ])
}
