import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import type { NumNode } from '@genshin-optimizer/pando/engine'
import type { TagMapNodeEntries, TagMapNodeEntry } from '../util'
import { self, tag } from '../util'

export function registerArt(
  sheet: ArtifactSetKey,
  ...data: (TagMapNodeEntry | TagMapNodeEntries)[]
): TagMapNodeEntries {
  /* Unlike character and weapon, artifact buff is all-or-nothing, so we can register every
   * buff as `key:art` and tag the formula as `key:key`. This means that `key:art`, which is
   * read on each `et:agg`, does not need to reread `key:key`. This greatly reduce `Read`
   * traffic due to the sheer numbers of `et:agg` calculations and `key:key` it would require
   * for each `key:art` read.
   */

  function internal({ tag: oldTag, value }: TagMapNodeEntry): TagMapNodeEntry {
    if (oldTag.sheet === sheet)
      // Special entries (usually stack count) that override `stack`
      return { tag: oldTag, value }

    // Add `key:art` to the tag and add `tag(key:<<key>>, value)` to set tags for calculation
    if (value.op === 'reread' || value.op === 'tag' || value.op === 'read')
      // Reuses `value` since it is already changing tags
      value = { ...value, tag: { ...value.tag, sheet } }
    else value = tag(value, { sheet })
    return { tag: { ...oldTag, sheet: 'art' }, value }
  }
  return data.flatMap((data) =>
    Array.isArray(data) ? data.map(internal) : internal(data)
  )
}

export function artCount(key: ArtifactSetKey): NumNode {
  return self.common.count.sheet(key)
}
