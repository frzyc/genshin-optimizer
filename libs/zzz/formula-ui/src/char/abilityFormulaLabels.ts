import type { CharacterKey, SkillKey } from '@genshin-optimizer/zzz/consts'
import { type AbilityDim, isAbilityDim } from '@genshin-optimizer/zzz/formula'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { i18n } from '@genshin-optimizer/zzz/i18n'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { parseAbilityFromTag } from '../abilityTag'
import {
  ABILITY_DIM_LABEL,
  abilityDimTooltipLabel,
  dimensionByAbilityDim,
} from '../formulaDimensionUi'
import { st, trans } from '../util'

type AbilitySheetDim = (typeof dimensionByAbilityDim)[AbilityDim]

export type AbilityDisplayResolved = {
  skill: SkillKey
  abilityKey: string
  hitIndex?: string
  abilityDim?: AbilityDim
  sheetDim?: AbilitySheetDim
}

function effectiveAbilitySkillHint(
  tag: Tag,
  skillHint?: SkillKey
): SkillKey | undefined {
  return skillHint && !tag.skillType ? skillHint : undefined
}

function tagForAbilityParse(tag: Tag, skillHint?: SkillKey): Tag {
  const hint = effectiveAbilitySkillHint(tag, skillHint)
  if (hint) return { ...tag, skillType: `${hint}Skill` }
  return tag
}

function nameI18nKey(resolved: AbilityDisplayResolved): string {
  return `${resolved.skill}.${resolved.abilityKey}.name`
}

function hitParamI18nKey(resolved: AbilityDisplayResolved): string | undefined {
  if (!resolved.hitIndex) return undefined
  const hitIndex = resolved.hitIndex.replace(/\D/g, '')
  return `${resolved.skill}.${resolved.abilityKey}.params.${hitIndex}`
}

/** Parsed ability identity + display dims for a formula tag. */
export function resolveAbilityDisplay(
  tag: Tag,
  skillHint?: SkillKey
): AbilityDisplayResolved | undefined {
  const parsed = parseAbilityFromTag(tagForAbilityParse(tag, skillHint))
  if (!parsed) return undefined

  const abilityDim = tag.q && isAbilityDim(tag.q) ? tag.q : undefined
  return {
    skill: parsed.skill,
    abilityKey: parsed.abilityKey,
    hitIndex: parsed.hitIndex,
    abilityDim,
    sheetDim: abilityDim ? dimensionByAbilityDim[abilityDim] : undefined,
  }
}

function abilityHitLabelString(
  charKey: CharacterKey,
  resolved: AbilityDisplayResolved
): string | undefined {
  const paramKey = hitParamI18nKey(resolved)
  if (!resolved.sheetDim || !paramKey || !resolved.hitIndex) return undefined

  const paramTranslated = i18n.t(paramKey, {
    ns: `char_${charKey}_gen`,
    defaultValue: resolved.hitIndex.replace(/\D/g, ''),
  })
  const dimSuffix = resolved.abilityDim
    ? ABILITY_DIM_LABEL[resolved.abilityDim]
    : ''
  const label = i18n.t(resolved.sheetDim, {
    ns: 'sheet',
    val: paramTranslated,
    defaultValue: dimSuffix
      ? `${paramTranslated}${dimSuffix}`
      : paramTranslated,
  })
  return label || undefined
}

function abilityBaseNameString(
  charKey: CharacterKey,
  resolved: AbilityDisplayResolved
): string {
  const translated = i18n.t(nameI18nKey(resolved), {
    ns: `char_${charKey}_gen`,
    defaultValue: '',
  })
  const base = translated || resolved.abilityKey
  if (resolved.abilityDim) {
    return `${base} ${abilityDimTooltipLabel(resolved.abilityDim)}`
  }
  return base
}

function abilityHitLabelNode(
  charKey: CharacterKey,
  resolved: AbilityDisplayResolved
): ReactNode | undefined {
  const paramKey = hitParamI18nKey(resolved)
  if (!resolved.sheetDim || !paramKey) return undefined

  return st(resolved.sheetDim, {
    val: `$t(char_${charKey}_gen:${paramKey})`,
  })
}

/** Translated hit label for an ability formula tag (`name` + `q`). */
export function abilityFormulaLabel(
  charKey: CharacterKey,
  tag: Tag,
  skillHint?: SkillKey
) {
  const resolved = resolveAbilityDisplay(tag, skillHint)
  if (!resolved) return undefined
  return abilityHitLabelNode(charKey, resolved)
}

/** Translated ability name for a formula tag. */
export function abilityDisplayTitle(
  charKey: CharacterKey,
  tag: Tag,
  skillHint?: SkillKey
): ReactNode | undefined {
  const resolved = resolveAbilityDisplay(tag, skillHint)
  if (!resolved) return undefined
  const [chg] = trans('char', charKey)
  return chg(nameI18nKey(resolved))
}

/** Translated hit param only (no sheet dim suffix), for multi-part opt-target rows. */
export function abilityHitParamTitle(
  charKey: CharacterKey,
  tag: Tag,
  skillHint?: SkillKey
): ReactNode | undefined {
  const resolved = resolveAbilityDisplay(tag, skillHint)
  const paramKey = resolved ? hitParamI18nKey(resolved) : undefined
  if (!resolved?.hitIndex || !paramKey) return undefined

  const [chg] = trans('char', charKey)
  return chg(paramKey)
}

export function abilityTagDisplay(
  charKey: CharacterKey,
  tag: Tag,
  skillHint?: SkillKey
): ReactNode | undefined {
  const resolved = resolveAbilityDisplay(tag, skillHint)
  if (!resolved) return undefined

  const hitLabel = abilityHitLabelNode(charKey, resolved)
  if (hitLabel) return hitLabel

  const [chg] = trans('char', charKey)
  const name = chg(nameI18nKey(resolved))
  if (!name) return undefined

  if (resolved.abilityDim) {
    return createElement(
      'span',
      null,
      name,
      ' ',
      abilityDimTooltipLabel(resolved.abilityDim)
    )
  }
  return name
}

export function abilityDisplayNameString(
  charKey: CharacterKey,
  tag: Tag,
  skillHint?: SkillKey
): string | undefined {
  const resolved = resolveAbilityDisplay(tag, skillHint)
  if (!resolved) return undefined

  const hitLabel = abilityHitLabelString(charKey, resolved)
  if (hitLabel) return hitLabel

  return abilityBaseNameString(charKey, resolved)
}
