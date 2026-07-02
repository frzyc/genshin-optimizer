import type { SkillKey } from '@genshin-optimizer/zzz/consts'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { abilityBaseName } from '@genshin-optimizer/zzz/formula'
import { skillFromTag } from './bundledFormulaFields'

export { abilityBaseName }

export function parseAbilityFromTag(
  tag: Tag
): { skill: SkillKey; abilityKey: string; hitIndex?: string } | undefined {
  const skill = skillFromTag(tag)
  if (!skill || !tag.name) return undefined

  const baseName = abilityBaseName(tag.name)
  const underscoreIdx = baseName.lastIndexOf('_')
  if (underscoreIdx === -1) return { skill, abilityKey: baseName }

  const abilityKey = baseName.slice(0, underscoreIdx)
  const hitIndex = baseName.slice(underscoreIdx + 1)
  if (!/^\d+$/.test(hitIndex)) return { skill, abilityKey: baseName }

  return { skill, abilityKey, hitIndex }
}

export function isAbilityFormulaTag(tag: Tag): boolean {
  return !!parseAbilityFromTag(tag)
}
