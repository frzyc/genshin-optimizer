import { type SkillKey, isSkillKey } from '@genshin-optimizer/zzz/consts'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { abilityBaseName } from '@genshin-optimizer/zzz/formula'

export { abilityBaseName }

export function skillFromTag(tag: Tag): SkillKey | undefined {
  const skillType = tag.skillType
  if (!skillType?.endsWith('Skill')) return undefined

  const skill = skillType.slice(0, -'Skill'.length)
  return isSkillKey(skill) ? skill : undefined
}

const AFTERSHOCK_HIT_SUFFIX = /_aftershock\d+$/

/** Split `AbilityName_0` or `AbilityName_aftershock0` into ability key + hit index. */
export function parseAbilityHitFromName(baseName: string): {
  abilityKey: string
  hitIndex?: string
} {
  const withoutAftershock = baseName.replace(AFTERSHOCK_HIT_SUFFIX, '')

  const underscoreIdx = withoutAftershock.lastIndexOf('_')
  if (underscoreIdx === -1) return { abilityKey: withoutAftershock }

  const hitIndex = withoutAftershock.slice(underscoreIdx + 1)
  if (!/^\d+$/.test(hitIndex)) return { abilityKey: withoutAftershock }

  return {
    abilityKey: withoutAftershock.slice(0, underscoreIdx),
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
