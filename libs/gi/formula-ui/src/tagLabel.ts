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

const chargedListingLabels: Record<string, string> = {
  charged_cyclic: 'Cyclic Charged Attack DMG',
  charged_final: 'Final Charged Attack DMG',
  charged_spin: 'Spinning Charged Attack DMG',
  charged_spinning: 'Spinning Charged Attack DMG',
  charged_aimed: 'Aimed Shot',
  charged_aimedCharged: 'Fully-Charged Aimed Shot',
  charged_fullyAimed: 'Fully-Charged Aimed Shot',
  charged_stam: 'Charged Attack Stamina Cost',
  charged_duration: 'Charged Attack Duration',
}

const plungingListingLabels: Record<string, string> = {
  plunging_dmg: 'Plunging Attack DMG',
  plunging_low: 'Low Plunge DMG',
  plunging_high: 'High Plunge DMG',
}

/** Fallback English title for Pando formula listing `name`s without a sheet row. */
export function formulaListingLabel(name: string): string | undefined {
  const normal = /^normal_(\d+)$/.exec(name)
  if (normal) return `Hit ${Number(normal[1]) + 1}`

  const chargedNum = /^charged_(\d+)$/.exec(name)
  if (chargedNum) return `Charged Attack Hit ${chargedNum[1]}`

  const charged = chargedListingLabels[name]
  if (charged) return charged

  const plunging = plungingListingLabels[name]
  if (plunging) return plunging

  if (name === 'skill') return 'Elemental Skill'
  if (name === 'burst') return 'Elemental Burst'

  if (name.endsWith('_cd')) return 'CD'
  if (name.endsWith('_duration')) return 'Duration'
  if (name.endsWith('_enerCost')) return 'Energy Cost'
  if (name.endsWith('_stam') || name.endsWith('_stamina')) {
    return 'Stamina Cost'
  }

  return undefined
}

/** Last-resort English title for catalog listing `name`s (optimize panel / tooltips). */
export function humanizeListingName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function catalogListingDisplayTitle(name: string): string {
  return formulaListingLabel(name) ?? humanizeListingName(name)
}

/** Resolve a `getTagLabel` key to the English title shown in formula text. */
export function tagLabelStr(key: string): string | undefined {
  return KeyMap.getStr(key) ?? extraStatLabels[key] ?? formulaListingLabel(key)
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
