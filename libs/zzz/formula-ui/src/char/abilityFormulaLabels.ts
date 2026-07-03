import type { CharacterKey, SkillKey } from '@genshin-optimizer/zzz/consts'
import { abilityBaseName, isAbilityDim } from '@genshin-optimizer/zzz/formula'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { parseAbilityHitFromName } from '../abilityTag'
import { dimensionByAbilityDim } from '../formulaDimensionUi'
import { st } from '../util'

function formulaDimensionFromTag(tag: Tag): string | undefined {
  if (isAbilityDim(tag.q)) return dimensionByAbilityDim[tag.q]
  return undefined
}

/** Translated hit label for a skill formula (`name` + `q`). */
export function abilityFormulaNameToTranslated(
  charKey: CharacterKey,
  skill: SkillKey,
  tag: Tag
) {
  const baseName = abilityBaseName(tag.name)
  const { abilityKey, hitIndex } = parseAbilityHitFromName(baseName)
  const type = formulaDimensionFromTag(tag)
  if (!type || !hitIndex) return baseName || tag.name || tag.q || ''
  return st(type, {
    val: `$t(char_${charKey}_gen:${skill}.${abilityKey}.params.${hitIndex.replace(/\D/g, '')})`,
  })
}
