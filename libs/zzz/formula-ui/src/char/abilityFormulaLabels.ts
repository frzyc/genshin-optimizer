import type { CharacterKey, SkillKey } from '@genshin-optimizer/zzz/consts'
import { isAbilityDim } from '@genshin-optimizer/zzz/formula'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { i18n } from '@genshin-optimizer/zzz/i18n'
import type { ReactNode } from 'react'
import { parseAbilityFromTag } from '../abilityTag'
import { namedAbilityDimLabel } from '../tagLabel'
import { trans } from '../sheetTranslate'

export type AbilityDisplayResolved = {
  skill: SkillKey
  abilityKey: string
  hitIndex?: string
}

type AbilityLabelPresentation = 'row' | 'selected'

type AbilityLabelContent = {
  string: string | undefined
  node: ReactNode | undefined
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

function hitParamTitleNode(
  charKey: CharacterKey,
  resolved: AbilityDisplayResolved
): ReactNode | undefined {
  const paramKey = hitParamI18nKey(resolved)
  if (!paramKey || !hitParamString(charKey, resolved)) return undefined
  const [chg] = trans('char', charKey)
  return chg(paramKey)
}

function rowLabelContent(
  charKey: CharacterKey,
  resolved: AbilityDisplayResolved
): AbilityLabelContent {
  const hitParam = hitParamString(charKey, resolved)
  const hitNode = hitParamTitleNode(charKey, resolved)
  return {
    string: hitParam ?? abilityNameString(charKey, resolved),
    node: hitNode ?? abilityDisplayNameNode(charKey, resolved),
  }
}

function resolveAbilityLabelContent(
  charKey: CharacterKey,
  resolved: AbilityDisplayResolved,
  presentation: AbilityLabelPresentation
): AbilityLabelContent {
  if (presentation === 'selected') {
    return {
      string: abilityNameString(charKey, resolved),
      node: abilityDisplayNameNode(charKey, resolved),
    }
  }
  return rowLabelContent(charKey, resolved)
}

function abilityLabel(
  charKey: CharacterKey,
  tag: Tag,
  presentation: AbilityLabelPresentation,
  output: 'react' | 'string'
): ReactNode | string | undefined {
  const resolved = resolveAbilityDisplay(tag)
  if (!resolved) return undefined
  const content = resolveAbilityLabelContent(charKey, resolved, presentation)
  return output === 'string' ? content.string : content.node
}

/** Ability name for selected opt-target rows. */
export function abilityDisplayTitle(
  charKey: CharacterKey,
  tag: Tag
): ReactNode | undefined {
  return abilityLabel(charKey, tag, 'selected', 'react') as
    | ReactNode
    | undefined
}

/** Hit param for selected opt-target rows (no dim suffix). */
export function abilityHitParamTitle(
  charKey: CharacterKey,
  tag: Tag
): ReactNode | undefined {
  const resolved = resolveAbilityDisplay(tag)
  if (!resolved) return undefined
  return rowLabelContent(charKey, resolved).node
}

/** Bundled / single ability row title (hit param or ability name). */
export function abilityRowTitleString(
  charKey: CharacterKey,
  tag: Tag
): string | undefined {
  return abilityLabel(charKey, tag, 'row', 'string') as string | undefined
}

/** Bundled / single ability row title (hit param or ability name). */
export function AbilityRowTitle({
  charKey,
  tag,
}: {
  charKey: CharacterKey
  tag: Tag
}) {
  const label = abilityLabel(charKey, tag, 'row', 'react')
  if (label) return label
  console.error('[zzz-formula-ui] Ability formula tag missing row label', {
    charKey,
    tag,
  })
  if (tag.q && isAbilityDim(tag.q)) {
    const label = namedAbilityDimLabel(tag)
    if (label) return label
  }
  const resolved = resolveAbilityDisplay(tag)
  return resolved?.abilityKey ?? tag.name ?? ''
}
