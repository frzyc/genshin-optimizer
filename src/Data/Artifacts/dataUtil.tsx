import { mergeData } from "../../Formula/api";
import { Data, DisplaySub } from "../../Formula/type";
import { ArtifactSetKey } from "../../Types/consts";

export function dataObjForArtifactSheet(
  key: ArtifactSetKey,
  data: Data = {},
  displayArtifact: DisplaySub = {},
): Data {
  return mergeData([data, {
    display: {
      [`artifact:${key}`]: displayArtifact
    },
  }])
}
