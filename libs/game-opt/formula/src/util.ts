import type {
  Sheet,
  Tag,
  TagMapNodeEntries,
  TagMapNodeEntry,
} from '@genshin-optimizer/game-opt/engine'
import { tag } from '@genshin-optimizer/game-opt/engine'

export function registerEquipment<Tag_ extends Tag>(
  specificSheet: Sheet<Tag_>,
  equipmentSheet: Sheet<Tag_>,
  ...data: (TagMapNodeEntry<Tag_> | TagMapNodeEntries<Tag_>)[]
): TagMapNodeEntries<Tag_> {
  /* == Below comment also applies for weapon, disc, wengine, relic, lightcone, etc.
   * Unlike character, artifact buff is all-or-nothing, so we can register every
   * buff as `sheet:art` and tag the formula as `sheet:<key>`. This means that `sheet:art`,
   * which is read on each `et:agg`, does not need to reread `sheet:<key>`. This greatly
   * reduce `Read` traffic due to the sheer numbers of `et:agg` calculations and `sheet:<key>`
   * it would require for each `sheet:art` read.
   */
  function internal({
    tag: oldTag,
    value,
  }: TagMapNodeEntry<Tag_>): TagMapNodeEntries<Tag_> {
    // Sheet-specific `enemy` stats adds to `enemyDeBuff` instead
    if (oldTag.et === 'enemy') oldTag = { ...oldTag, et: 'enemyDeBuff' }
    // Special entries (usually stack count) that override `stack`
    if (oldTag.sheet === specificSheet) return [{ tag: oldTag, value }]

    // Add `sheet:art` to the tag and add `tag(sheet:<key>, value)` to set tags for calculation
    if (
      value.op === 'reread' ||
      // Make sure that adding `sheet:<key>` and removing `et:*Buff` are separate steps
      ((value.op === 'tag' || value.op === 'read') &&
        !oldTag.et?.endsWith('Buff'))
    )
      // Reuses `value` since it is already changing tags
      value = { ...value, tag: { ...value.tag, sheet: specificSheet } }
    else value = tag(value, { sheet: specificSheet })
    return [
      { tag: { ...oldTag, sheet: equipmentSheet }, value },
      { tag: { ...oldTag, sheet: specificSheet }, value },
    ]
  }
  return data.flatMap((data) =>
    Array.isArray(data) ? data.flatMap(internal) : internal(data),
  )
}
