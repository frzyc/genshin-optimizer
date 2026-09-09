import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import type { ElementWithPhyKey } from '@genshin-optimizer/gi/consts'
import type { Tag } from '@genshin-optimizer/gi/formula'
import {
  elementalData,
  hitMoves,
  KeyMap,
  type HitMoveKey,
} from '@genshin-optimizer/gi/keymap'

/** Pando-only display keys that are not Waverider `KeyMap` stats. */
const extraStatLabels: Record<string, string> = {
  char_lvl: 'Character Level',
  weapon_lvl: 'Weapon Level',
  resMulti_: 'Enemy DMG RES Multiplier',
  critMulti: 'Crit Multiplier',
}
for (const [ele, { name }] of Object.entries(elementalData)) {
  extraStatLabels[`${ele}_resMulti_`] = `Enemy ${name} DMG RES Multiplier`
}

/** Resolve a `getTagLabel` key to the English title shown in formula text. */
export function tagLabelStr(key: string): string | undefined {
  return KeyMap.getStr(key) ?? extraStatLabels[key]
}

/** Stat highlight / KeyMap key for listing stat rows (not named formula hits). */
export function statKeyFromListingTag(tag: Tag): string {
  if (tag.name) return ''
  if (tag.ele && tag.q === 'dmg_') return `${tag.ele}_dmg_`
  if (tag.ele && tag.q) {
    const composed = `${tag.ele}_${tag.q}`
    if (tagLabelStr(composed)) return composed
  }
  if (tag.q === 'cappedCritRate_') return 'critRate_'
  return tag.q ?? ''
}

export function getTagLabel(tag: Tag | undefined | null): string {
  if (!tag) return ''
  const { et, q, qt, name, ele } = tag
  if (et === 'own' && qt === 'formula' && q !== 'base') {
    return name ?? q ?? ''
  }
  if (q === 'lvl') {
    if (et === 'enemy') return 'enemyLevel'
    if (qt === 'weapon') return 'weapon_lvl'
    return 'char_lvl'
  }
  if (q === 'def_mult_') return 'enemyDef_multi_'
  if (q === 'postRes') return ele ? `${ele}_resMulti_` : 'resMulti_'
  if (q === 'preRes') return ele ? `${ele}_enemyRes_` : ''
  if (q === 'defRed_') return 'enemyDefRed_'
  if (q === 'defIgn') return 'enemyDefIgn_'
  if (q === 'critMulti') return 'critMulti'
  return statKeyFromListingTag(tag) || q || qt || ''
}

/**
 * Log when a tag would render as a raw key. `q: '_'` (percent() dummy) always
 * errors; other unmapped keys only in dev (ZZZ `warnUnresolvedTagLabel`).
 */
export function warnUnresolvedTagLabel(tag: Tag, label: string): void {
  if (!label) return
  if (tagLabelStr(label)) return
  if (label !== '_' && !shouldShowDevComponents) return
  console.error(
    '[gi-formula-ui] Unresolved tag label: expected a KeyMap entry or sheet title',
    { tag, label }
  )
}

/** Element / reaction / heal color for listing titles (field rows + tooltips). */
export function tagTitleColor(tag: Tag) {
  return KeyMap.getVariant(getTagLabel(tag)) ?? tag.ele ?? undefined
}

export function moveBadgeLabel(move: string) {
  return hitMoves[move as HitMoveKey] ?? move
}

export function elementBadgeLabel(ele: string) {
  return (
    elementalData[ele as ElementWithPhyKey]?.name ??
    ele.charAt(0).toUpperCase() + ele.slice(1)
  )
}
