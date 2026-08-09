import type { CharacterKey, SkillKey } from '@genshin-optimizer/zzz/consts'
import { type AbilityDim, isAbilityDim } from '@genshin-optimizer/zzz/formula'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { i18n } from '@genshin-optimizer/zzz/i18n'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { parseAbilityFromTag } from '../abilityTag'
import {
  abilityDimTooltipLabel,
  dimensionByAbilityDim,
} from '../formulaDimensionUi'
import { st, trans } from '../util'

type AbilitySheetDim = (typeof dimensionByAbilityDim)[AbilityDim]

type AbilityDisplayResolved = {
  skill: SkillKey
  abilityKey: string
  hitIndex?: string
  abilityDim?: AbilityDim
  sheetDim?: AbilitySheetDim
}

type AbilityLabelStyle = 'field' | 'name' | 'bundle'

type AbilityLabelContent = {
  string: string | undefined
  node: ReactNode | undefined
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

function abilityDimSuffix(abilityDim: AbilityDim): string {
  return abilityDimTooltipLabel(abilityDim)
}

function abilityHitLabelString(
  charKey: CharacterKey,
  resolved: AbilityDisplayResolved
): string | undefined {
  const paramKey = hitParamI18nKey(resolved)
  if (!resolved.sheetDim || !paramKey || !resolved.hitIndex) return undefined

  const paramTranslated = hitParamString(charKey, resolved)
  if (!paramTranslated) return undefined
  const dimSuffix = resolved.abilityDim
    ? abilityDimSuffix(resolved.abilityDim)
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
  const base = abilityNameString(charKey, resolved)
  if (resolved.abilityDim) {
    return `${base} ${abilityDimSuffix(resolved.abilityDim)}`
  }
  return base
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

function abilityHitLabelNode(
  charKey: CharacterKey,
  resolved: AbilityDisplayResolved
): ReactNode | undefined {
  if (!resolved.sheetDim || !hitParamString(charKey, resolved)) return undefined

  const paramKey = hitParamI18nKey(resolved)!
  return st(resolved.sheetDim, {
    val: `$t(char_${charKey}_gen:${paramKey})`,
  })
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

function fieldLabelNode(
  charKey: CharacterKey,
  resolved: AbilityDisplayResolved
): ReactNode | undefined {
  const hitLabel = abilityHitLabelNode(charKey, resolved)
  if (hitLabel) return hitLabel
  const name = abilityDisplayNameNode(charKey, resolved)
  if (resolved.abilityDim) {
    return createElement(
      'span',
      null,
      name,
      ' ',
      abilityDimSuffix(resolved.abilityDim)
    )
  }
  return name
}

/** Hit param and optional ability-name fallback (bundle row title vs opt-target hit crumb). */
function bundleLabelContent(
  charKey: CharacterKey,
  resolved: AbilityDisplayResolved,
  opts: { nameFallback: boolean }
): AbilityLabelContent {
  const hitParam = hitParamString(charKey, resolved)
  const hitNode = hitParamTitleNode(charKey, resolved)
  if (!opts.nameFallback && !hitParam) {
    return { string: undefined, node: undefined }
  }
  return {
    string: hitParam ?? abilityNameString(charKey, resolved),
    node: hitNode ?? abilityDisplayNameNode(charKey, resolved),
  }
}

function resolveAbilityLabelContent(
  charKey: CharacterKey,
  resolved: AbilityDisplayResolved,
  style: AbilityLabelStyle
): AbilityLabelContent {
  switch (style) {
    case 'name':
      return {
        string: abilityBaseNameString(charKey, resolved),
        node: abilityDisplayNameNode(charKey, resolved),
      }
    case 'bundle':
      return bundleLabelContent(charKey, resolved, { nameFallback: true })
    case 'field':
      return {
        string:
          abilityHitLabelString(charKey, resolved) ??
          abilityBaseNameString(charKey, resolved),
        node: fieldLabelNode(charKey, resolved),
      }
  }
}

function abilityLabel(
  charKey: CharacterKey,
  tag: Tag,
  style: AbilityLabelStyle,
  output: 'react' | 'string',
  skillHint?: SkillKey
): ReactNode | string | undefined {
  const resolved = resolveAbilityDisplay(tag, skillHint)
  if (!resolved) return undefined
  const content = resolveAbilityLabelContent(charKey, resolved, style)
  return output === 'string' ? content.string : content.node
}

/** Translated ability name for a formula tag. */
export function abilityDisplayTitle(
  charKey: CharacterKey,
  tag: Tag,
  skillHint?: SkillKey
): ReactNode | undefined {
  return abilityLabel(charKey, tag, 'name', 'react', skillHint) as
    | ReactNode
    | undefined
}

/** Translated hit param only (no sheet dim suffix), for multi-part opt-target rows. */
export function abilityHitParamTitle(
  charKey: CharacterKey,
  tag: Tag,
  skillHint?: SkillKey
): ReactNode | undefined {
  const resolved = resolveAbilityDisplay(tag, skillHint)
  if (!resolved) return undefined
  return bundleLabelContent(charKey, resolved, { nameFallback: false }).node
}

function AbilityBundleTitleInner({
  charKey,
  tag,
  skillHint,
}: {
  charKey: CharacterKey
  tag: Tag
  skillHint?: SkillKey
}) {
  const label = abilityLabel(charKey, tag, 'bundle', 'react', skillHint)
  return label ?? null
}

/** Lazy i18n bundle row title; defers lookup until render (sheet docs build at import). */
export function abilityBundleTitle(
  charKey: CharacterKey,
  tag: Tag,
  skillHint?: SkillKey
): ReactNode {
  return createElement(AbilityBundleTitleInner, { charKey, tag, skillHint })
}

export function abilityTagDisplay(
  charKey: CharacterKey,
  tag: Tag,
  skillHint?: SkillKey
): ReactNode | undefined {
  return abilityLabel(charKey, tag, 'field', 'react', skillHint) as
    | ReactNode
    | undefined
}

export function abilityDisplayNameString(
  charKey: CharacterKey,
  tag: Tag,
  skillHint?: SkillKey
): string | undefined {
  return abilityLabel(charKey, tag, 'field', 'string', skillHint) as
    | string
    | undefined
}
