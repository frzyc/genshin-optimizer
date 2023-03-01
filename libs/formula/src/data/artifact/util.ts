import { ArtifactSetKey } from '@genshin-optimizer/consts';
import { AnyNode, NumNode, RawTagMapEntries, ReRead, tag } from '@genshin-optimizer/waverider';
import { Data, self } from "../util";

export function registerArt(src: ArtifactSetKey, ...data: (Data | Data[number])[]): Data {
  function internal({ tag: oldTag, value }: Data[number]): Data[number] {
    if (value.op === 'reread' || value.op === 'tag' || value.op === 'read')
      value = { ...value, tag: { ...value.tag, src } }
    else
      value = tag(value, { src })
    return { tag: { ...oldTag, src: 'art' }, value }
  }
  return data.flatMap(data => Array.isArray(data) ? data.map(internal) : internal(data))
}

export function artCount(name: ArtifactSetKey): NumNode {
  return self.common.count.with('src', name)
}

export function entriesForArt(
  _: ArtifactSetKey
): RawTagMapEntries<AnyNode | ReRead> {
  return []
}
