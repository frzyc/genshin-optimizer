import type { CharacterKey, SkillKey } from '@genshin-optimizer/zzz/consts'
import { abilityBaseName, isAbilityDim } from '@genshin-optimizer/zzz/formula'
import type { Tag } from '@genshin-optimizer/zzz/formula'
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
  const [ability, hitNumber] = baseName.split('_')
  const type = formulaDimensionFromTag(tag)
  if (!type || !hitNumber) return baseName || tag.name || tag.q || ''
  return st(type, {
    val: `$t(char_${charKey}_gen:${skill}.${ability}.params.${hitNumber.replace(/\D/g, '')})`,
  })
}
