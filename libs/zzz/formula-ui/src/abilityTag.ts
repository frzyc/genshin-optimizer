import { type SkillKey, isSkillKey } from '@genshin-optimizer/zzz/consts'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { abilityBaseName } from '@genshin-optimizer/zzz/formula'

export { abilityBaseName }

export function skillFromTag(tag: Tag): SkillKey | undefined {
  const skillType = tag.skillType1
  if (!skillType?.endsWith('Skill')) return undefined

  const skill = skillType.slice(0, -'Skill'.length)
  return isSkillKey(skill) ? skill : undefined
}

/** Split `AbilityName_0` into ability key + numeric hit index. */
export function parseAbilityHitFromName(baseName: string): {
  abilityKey: string
  hitIndex?: string
} {
  const underscoreIdx = baseName.lastIndexOf('_')
  if (underscoreIdx === -1) return { abilityKey: baseName }

  const hitIndex = baseName.slice(underscoreIdx + 1)
  if (!/^\d+$/.test(hitIndex)) return { abilityKey: baseName }

  return {
    abilityKey: baseName.slice(0, underscoreIdx),
    hitIndex,
  }
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
