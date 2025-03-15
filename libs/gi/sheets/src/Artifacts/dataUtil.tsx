import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import {
  inferInfoMut,
  mergeData,
  type Data,
  type DisplaySub,
} from '@genshin-optimizer/gi/wr'

export function dataObjForArtifactSheet(
  key: ArtifactSetKey,
  data: Data = {},
  displayArtifact: DisplaySub = {},
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
