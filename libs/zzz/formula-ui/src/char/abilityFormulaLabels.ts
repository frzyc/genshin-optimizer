import type { CharacterKey, SkillKey } from '@genshin-optimizer/zzz/consts'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { i18n } from '@genshin-optimizer/zzz/i18n'
import type { ReactNode } from 'react'
import { parseAbilityFromTag } from '../abilityTag'
import { trans } from '../sheetTranslate'

type AbilityIdentity = NonNullable<ReturnType<typeof parseAbilityFromTag>>

function nameI18nKey(ability: AbilityIdentity): string {
  return `${ability.skill}.${ability.abilityKey}.name`
}

function hitParamI18nKey(ability: AbilityIdentity): string | undefined {
  if (!ability.hitIndex) return undefined
  const hitIndex = ability.hitIndex.replace(/\D/g, '')
  return `${ability.skill}.${ability.abilityKey}.params.${hitIndex}`
}

function hitParamString(
  charKey: CharacterKey,
  ability: AbilityIdentity
): string | undefined {
  const paramKey = hitParamI18nKey(ability)
  if (!ability.hitIndex || !paramKey) return undefined

  const paramTranslated = i18n.t(paramKey, {
    ns: `char_${charKey}_gen`,
    defaultValue: ability.hitIndex.replace(/\D/g, ''),
  })
  return paramTranslated.trim() ? paramTranslated : undefined
}

function abilityNameString(
  charKey: CharacterKey,
  ability: AbilityIdentity
): string {
  const translated = i18n.t(nameI18nKey(ability), {
    ns: `char_${charKey}_gen`,
    defaultValue: '',
  })
  return translated || ability.abilityKey
}

function abilityDisplayNameNode(
  charKey: CharacterKey,
  ability: AbilityIdentity
): ReactNode {
  const name = abilityNameString(charKey, ability)
  if (name === ability.abilityKey) return name
  const [chg] = trans('char', charKey)
  return chg(nameI18nKey(ability))
}

/** Ability name, optional hit param, and skill for formula tags. */
export function abilityLabelParts(tag: Tag):
  | {
      skill: SkillKey
      name: ReactNode
      hitLabel: string | undefined
    }
  | undefined {
  const ability = parseAbilityFromTag(tag)
  const charKey = tag.sheet as CharacterKey | undefined
  if (!ability || !charKey) return undefined
  return {
    skill: ability.skill,
    name: abilityDisplayNameNode(charKey, ability),
    hitLabel: hitParamString(charKey, ability),
  }
}

/** Bundled / single ability row title (hit param or ability name). */
export function AbilityRowTitle({ tag }: { tag: Tag }) {
  const parts = abilityLabelParts(tag)
  if (!parts) {
    console.error('[zzz-formula-ui] Ability formula tag missing row label', {
      tag,
    })
    return null
  }
  return parts.hitLabel ?? parts.name
}
