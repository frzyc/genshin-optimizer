import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type { Data, DisplaySub } from '@genshin-optimizer/gi/wr'
import { inferInfoMut, mergeData } from '../../Formula/api'

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
