import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allCharacterKeys, statKeyTextMap } from '@genshin-optimizer/zzz/consts'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { abilityBaseName } from '@genshin-optimizer/zzz/formula'
import { parseAbilityHitFromName } from './abilityTag'
import { abilityDisplayNameString } from './char/abilityFormulaLabels'
import { statKeyFromListingTag } from './optTarget'

const formulaBaseQs = new Set([
  'standardDmgBase',
  'sheerDmgBase',
  'anomalyDmgBase',
  'shieldBase',
  'dazeBuildupBase',
  'anomBuildupBase',
  'healBase',
])

/** String key for units / fallback display — never looks up `tagFieldMap`. */
export function getTagLabel(tag: Tag | undefined | null): string {
  if (!tag) return ''
  const { et, q, qt, name } = tag
  if (et === 'own' && qt === 'formula' && q && formulaBaseQs.has(q))
    return 'base'
  if (et === 'own' && qt === 'formula' && q !== 'base') {
    if (
      name &&
      tag.sheet &&
      allCharacterKeys.includes(tag.sheet as CharacterKey)
    ) {
      const display = abilityDisplayNameString(tag.sheet as CharacterKey, tag)
      if (display) return display
    }
    if (name) {
      return parseAbilityHitFromName(abilityBaseName(name)).abilityKey
    }
    return q ?? ''
  }
  const statKey = statKeyFromListingTag(tag)
  if (statKey) return statKey
  return q ?? ''
}

/** Dev-only: log when a tag falls through to a raw q / stat key with no display mapping. */
export function warnUnresolvedTagLabel(tag: Tag, label: string): void {
  if (!shouldShowDevComponents || !label) return
  const mappedStatKey = statKeyFromListingTag(tag)
  if (mappedStatKey && statKeyTextMap[mappedStatKey]) return
  if (statKeyTextMap[label]) return
  console.error(
    '[zzz-formula-ui] Unresolved tag label: expected a mapped stat or sheet title',
    { tag, label }
  )
}
