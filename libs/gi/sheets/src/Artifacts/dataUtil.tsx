import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import {
  type Data,
  type DisplaySub,
  inferInfoMut,
  mergeData,
} from '@genshin-optimizer/gi/wr'

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
