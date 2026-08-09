import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allCharacterKeys } from '@genshin-optimizer/zzz/consts'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { abilityBaseName } from '@genshin-optimizer/zzz/formula'
import { parseAbilityHitFromName } from './abilityTag'
import { abilityDisplayNameString } from './char/abilityFormulaLabels'

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
  return q ?? ''
}
