import type { CharacterKey, SkillKey } from '@genshin-optimizer/zzz/consts'
import { abilityBaseName, isAbilityDim } from '@genshin-optimizer/zzz/formula'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { parseAbilityFromTag } from '../abilityTag'
import { dimensionByAbilityDim } from '../formulaDimensionUi'
import { st } from '../util'

function formulaDimensionFromTag(tag: Tag): string | undefined {
  if (isAbilityDim(tag.q)) return dimensionByAbilityDim[tag.q]
  return undefined
}

/** Translated hit label for an ability formula tag (`name` + `q`). */
export function abilityFormulaLabel(
  charKey: CharacterKey,
  tag: Tag,
  skillOverride?: SkillKey
) {
  const parsed = parseAbilityFromTag(
    skillOverride && !tag.skillType
      ? { ...tag, skillType: `${skillOverride}Skill` }
      : tag
  )
  const type = formulaDimensionFromTag(tag)
  if (!type || !parsed?.hitIndex) return undefined

  return st(type, {
    val: `$t(char_${charKey}_gen:${parsed.skill}.${parsed.abilityKey}.params.${parsed.hitIndex})`,
  })
}

/** Translated hit label for a skill formula, with a stable fallback. */
export function abilityFormulaNameToTranslated(
  charKey: CharacterKey,
  skill: SkillKey,
  tag: Tag
) {
  return (
    abilityFormulaLabel(charKey, tag, skill) ??
    (tag.name ? abilityBaseName(tag.name) : undefined) ??
    tag.name ??
    tag.q ??
    ''
  )
}
