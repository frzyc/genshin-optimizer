import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import { elementalData, statKeyTextMap } from '@genshin-optimizer/zzz/consts'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { isAbilityDim } from '@genshin-optimizer/zzz/formula'
import { damageTypeKeysMap } from './char/util'
import { ABILITY_DIM_LABEL } from './formulaDimensionUi'
import { statKeyFromListingTag } from './listingStatLabels'

const formulaBaseQs = new Set([
  'standardDmgBase',
  'sheerDmgBase',
  'anomalyDmgBase',
  'shieldBase',
  'dazeBuildupBase',
  'anomBuildupBase',
  'healBase',
])

/** Attribute / damage-type prefix plus a trailing label segment. */
export function tagQualifierLabel(tag: Tag, suffix: string): string {
  return [
    ...(tag.attribute ? [elementalData[tag.attribute]] : []),
    ...(tag.damageType1 ? [damageTypeKeysMap[tag.damageType1]] : []),
    ...(tag.damageType2 ? [damageTypeKeysMap[tag.damageType2]] : []),
    suffix,
  ].join(' ')
}

/** Label for named formula tags with an ability-dim `q` (e.g. m6 bonus DMG). */
export function namedAbilityDimLabel(tag: Tag): string | undefined {
  if (!tag.name || !tag.q || !isAbilityDim(tag.q)) return undefined
  return tagQualifierLabel(tag, ABILITY_DIM_LABEL[tag.q])
}

/** String key for units / fallback display — never looks up `tagFieldMap`. */
export function getTagLabel(tag: Tag | undefined | null): string {
  if (!tag) return ''
  const { et, q, qt } = tag
  if (et === 'own' && qt === 'formula' && q && formulaBaseQs.has(q))
    return 'base'
  if (et === 'own' && qt === 'formula' && q !== 'base') return q ?? ''
  const statKey = statKeyFromListingTag(tag)
  if (statKey) return statKey
  return q ?? ''
}

/** Dev-only: log when a tag falls through to a raw q / stat key with no display mapping. */
export function warnUnresolvedTagLabel(tag: Tag, label: string): void {
  if (!shouldShowDevComponents || !label) return
  if (statKeyTextMap[label as keyof typeof statKeyTextMap]) return
  console.error(
    '[zzz-formula-ui] Unresolved tag label: expected a mapped stat or sheet title',
    { tag, label }
  )
}
