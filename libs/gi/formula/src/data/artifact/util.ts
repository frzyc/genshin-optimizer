import { tag } from '@genshin-optimizer/gameOpt/engine'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { type NumNode } from '@genshin-optimizer/pando/engine'
import type { TagMapNodeEntries, TagMapNodeEntry } from '../util'
import { own } from '../util'

export function registerArt(
  sheet: ArtifactSetKey,
  ...data: (TagMapNodeEntry | TagMapNodeEntries)[]
): TagMapNodeEntries {
  /* Unlike character and weapon, artifact buff is all-or-nothing, so we can register every
   * buff as `sheet:art` and tag the formula as `sheet:<key>`. This means that `sheet:art`,
   * which is read on each `et:agg`, does not need to reread `sheet:<key>`. This greatly
   * reduce `Read` traffic due to the sheer numbers of `et:agg` calculations and `sheet:<key>`
   * it would require for each `sheet:art` read.
   */
  function internal({ tag: oldTag, value }: TagMapNodeEntry): TagMapNodeEntry {
    // Sheet-specific `enemy` stats adds to `enemyDeBuff` instead
    if (oldTag.et === 'enemy') oldTag = { ...oldTag, et: 'enemyDeBuff' }
    // Special entries (usually stack count) that override `stack`
    if (oldTag.sheet === sheet) return { tag: oldTag, value }

    // Add `sheet:art` to the tag and add `tag(sheet:<key>, value)` to set tags for calculation
    if (
      value.op === 'reread' ||
      // Make sure that adding `sheet:<key>` and removing `et:*Buff` are separate steps
      ((value.op === 'tag' || value.op === 'read') &&
        !oldTag.et?.endsWith('Buff'))
    )
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
  return own.common.count.sheet(key)
}
