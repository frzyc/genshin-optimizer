import type { ArtifactSetKey } from '@genshin-optimizer/consts'
import type { NumNode } from '@genshin-optimizer/waverider'
import type { Data } from '../util'
import { self, tag } from '../util'

export function registerArt(
  src: ArtifactSetKey,
  ...data: (Data | Data[number])[]
): Data {
  /* Unlike character and weapon, artifact buff is all-or-nothing, so we can register every
   * buff as `src:art` and tag the formula as `src:src`. This means that `src:art`, which is
   * read on each `et:agg`, does not need to reread `src:src`. This greatly reduce `Read`
   * traffic due to the sheer numbers of `et:agg` calculations and `src:src` it would require
   * for each `src:art` read.
   */

  function internal({ tag: oldTag, value }: Data[number]): Data[number] {
    if (oldTag.src === src)
      // Special entries (usually stack count) that override `stack`
      return { tag: oldTag, value }

    // Add `src:art` to the tag and add `tag(src:<<src>>, value)` to set tags for calculation
    if (value.op === 'reread' || value.op === 'tag' || value.op === 'read')
      // Reuses `value` since it is already changing tags
      value = { ...value, tag: { ...value.tag, src } }
    else value = tag(value, { src })
    return { tag: { ...oldTag, src: 'art' }, value }
  }
  return data.flatMap((data) =>
    Array.isArray(data) ? data.map(internal) : internal(data)
  )
}

export function artCount(name: ArtifactSetKey): NumNode {
  return self.common.count.with('src', name)
}
