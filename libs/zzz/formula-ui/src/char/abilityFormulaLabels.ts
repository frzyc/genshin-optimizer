import type { CharacterKey, SkillKey } from '@genshin-optimizer/zzz/consts'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { i18n } from '@genshin-optimizer/zzz/i18n'
import type { ReactNode } from 'react'
import { parseAbilityFromTag } from '../abilityTag'
import { trans } from '../sheetTranslate'

export type AbilityDisplayResolved = {
  skill: SkillKey
  abilityKey: string
  hitIndex?: string
}

function nameI18nKey(resolved: AbilityDisplayResolved): string {
  return `${resolved.skill}.${resolved.abilityKey}.name`
}

function hitParamI18nKey(resolved: AbilityDisplayResolved): string | undefined {
  if (!resolved.hitIndex) return undefined
  const hitIndex = resolved.hitIndex.replace(/\D/g, '')
  return `${resolved.skill}.${resolved.abilityKey}.params.${hitIndex}`
}

function isBlankHitParam(text: string): boolean {
  return !text.trim()
}

function hitParamString(
  charKey: CharacterKey,
  resolved: AbilityDisplayResolved
): string | undefined {
  const paramKey = hitParamI18nKey(resolved)
  if (!resolved.hitIndex || !paramKey) return undefined

  const paramTranslated = i18n.t(paramKey, {
    ns: `char_${charKey}_gen`,
    defaultValue: resolved.hitIndex.replace(/\D/g, ''),
  })
  return isBlankHitParam(paramTranslated) ? undefined : paramTranslated
}

function abilityNameString(
  charKey: CharacterKey,
  resolved: AbilityDisplayResolved
): string {
  const translated = i18n.t(nameI18nKey(resolved), {
    ns: `char_${charKey}_gen`,
    defaultValue: '',
  })
  return translated || resolved.abilityKey
}

/** Parsed ability identity for a complete formula tag. */
export function resolveAbilityDisplay(
  tag: Tag
): AbilityDisplayResolved | undefined {
  const parsed = parseAbilityFromTag(tag)
  if (!parsed) return undefined

  return {
    skill: parsed.skill,
    abilityKey: parsed.abilityKey,
    hitIndex: parsed.hitIndex,
  }
}

function abilityDisplayNameNode(
  charKey: CharacterKey,
  resolved: AbilityDisplayResolved
): ReactNode {
  const name = abilityNameString(charKey, resolved)
  if (name === resolved.abilityKey) return name
  const [chg] = trans('char', charKey)
  return chg(nameI18nKey(resolved))
}

function abilityRowLabel(
  charKey: CharacterKey,
  resolved: AbilityDisplayResolved
): ReactNode {
  return (
    hitParamString(charKey, resolved) ??
    abilityDisplayNameNode(charKey, resolved)
  )
}

function abilitySelectedLabel(
  charKey: CharacterKey,
  resolved: AbilityDisplayResolved
): ReactNode {
  return abilityDisplayNameNode(charKey, resolved)
}

/** Ability name for selected opt-target rows. */
export function abilityDisplayTitle(
  charKey: CharacterKey,
  tag: Tag
): ReactNode | undefined {
  const resolved = resolveAbilityDisplay(tag)
  if (!resolved) return undefined
  return abilitySelectedLabel(charKey, resolved)
}

/** Hit param label when `resolveAbilityDisplay` is already available. */
export function abilityHitParamLabel(
  charKey: CharacterKey,
  resolved: AbilityDisplayResolved
): ReactNode | undefined {
  return hitParamString(charKey, resolved)
}

/** Bundled / single ability row title (hit param or ability name). */
export function AbilityRowTitle({
  charKey,
  tag,
}: {
  charKey: CharacterKey
  tag: Tag
}) {
  const resolved = resolveAbilityDisplay(tag)
  if (!resolved) {
    console.error('[zzz-formula-ui] Ability formula tag missing row label', {
      charKey,
      tag,
    })
    return null
  }
  return abilityRowLabel(charKey, resolved)
}
