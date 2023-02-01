import { AnyNode, NumNode, RawTagMapEntries, ReRead } from '@genshin-optimizer/waverider';
import { Artifact, self } from "../util";

export function artCount(name: Artifact): NumNode {
  return self.common.count.with('src', name)
}

export function entriesForArt(
  _: Artifact
): RawTagMapEntries<AnyNode | ReRead> {
  return []
}
