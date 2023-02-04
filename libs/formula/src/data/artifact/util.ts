import { ArtifactSetKey } from '@genshin-optimizer/consts';
import { AnyNode, NumNode, RawTagMapEntries, ReRead } from '@genshin-optimizer/waverider';
import { self } from "../util";

export function artCount(name: ArtifactSetKey): NumNode {
  return self.common.count.with('src', name)
}

export function entriesForArt(
  _: ArtifactSetKey
): RawTagMapEntries<AnyNode | ReRead> {
  return []
}
