import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import { elementalData, statKeyTextMap } from '@genshin-optimizer/zzz/consts'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { isAbilityDim } from '@genshin-optimizer/zzz/formula'
import { damageTypeKeysMap } from './char/util'
import { dimLabel } from './dimLabels'
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
  return tagQualifierLabel(tag, dimLabel(tag.q))
}

export function stagedStatKey(
  qt?: string | null,
  q?: string | null
): string | undefined {
  if (!qt || !q) return undefined
  if (statKeyTextMap[`${qt}_${q}`]) return `${qt}_${q}`
  if (qt === 'combat' && statKeyTextMap[`cond_${q}`]) return `cond_${q}`
  return undefined
}

function firstMappedKey(
  ...keys: Array<string | undefined | null>
): string | undefined {
  for (const key of keys) {
    if (key && statKeyTextMap[key]) return key
  }
  return undefined
}

export function getTagLabel(tag: Tag | undefined | null): string {
  if (!tag) return ''
  const { et, q, qt, attribute } = tag
  if (et === 'own' && qt === 'formula' && q && formulaBaseQs.has(q))
    return 'base'
  if (et === 'own' && qt === 'formula' && q !== 'base') return q ?? ''
  const attributedKey = attribute && q ? `${attribute}_${q}` : undefined
  const staged = attribute ? undefined : stagedStatKey(qt, q)
  const listing = statKeyFromListingTag(tag) || undefined
  const mapped = firstMappedKey(attributedKey, staged, listing, q)
  if (mapped) return mapped
  return listing ?? q ?? ''
}

/** Apply attribute / damage-type prefixes when they are not already in `key`. */
export function qualifyMappedLabel(
  tag: Tag,
  key: string,
  mapped: string
): string {
  const attrInKey = !!(tag.attribute && key.startsWith(`${tag.attribute}_`))
  const qualifyTag = attrInKey ? { ...tag, attribute: undefined } : tag
  if (
    qualifyTag.attribute ||
    qualifyTag.damageType1 ||
    qualifyTag.damageType2
  ) {
    return tagQualifierLabel(qualifyTag, mapped)
  }
  return mapped
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
