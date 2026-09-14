import { isSkillKey, type SkillKey } from '@genshin-optimizer/zzz/consts'
import {
  abilityBaseName,
  parseAbilityHitFromName,
  type Tag,
} from '@genshin-optimizer/zzz/formula'

export { abilityBaseName, parseAbilityHitFromName }

export function skillFromTag(tag: Tag): SkillKey | undefined {
  const skillType = tag.skillType
  if (!skillType?.endsWith('Skill')) return undefined

  const skill = skillType.slice(0, -'Skill'.length)
  return isSkillKey(skill) ? skill : undefined
}

export function parseAbilityFromTag(
  tag: Tag
): { skill: SkillKey; abilityKey: string; hitIndex?: string } | undefined {
  const skill = skillFromTag(tag)
  if (!skill || !tag.name) return undefined

  const { abilityKey, hitIndex } = parseAbilityHitFromName(
    abilityBaseName(tag.name)
  )
  return { skill, abilityKey, hitIndex }
}

export function isAbilityFormulaTag(tag: Tag): boolean {
  return !!parseAbilityFromTag(tag)
}
