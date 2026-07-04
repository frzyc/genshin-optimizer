import type { CharacterKey, SkillKey } from '@genshin-optimizer/zzz/consts'
import { isAbilityDim } from '@genshin-optimizer/zzz/formula'
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

function formulaDimensionFromTag(tag: Tag): string | undefined {
  if (isAbilityDim(tag.q)) return dimensionByAbilityDim[tag.q]
  return undefined
}

function tagForAbilityParse(tag: Tag, skillOverride?: SkillKey): Tag {
  if (skillOverride && !tag.skillType) {
    return { ...tag, skillType: `${skillOverride}Skill` }
  }
  return tag
}

/** Translated hit label for an ability formula tag (`name` + `q`). */
export function abilityFormulaLabel(
  charKey: CharacterKey,
  tag: Tag,
  skillOverride?: SkillKey
) {
  const parsed = parseAbilityFromTag(tagForAbilityParse(tag, skillOverride))
  const type = formulaDimensionFromTag(tag)
  if (!type || !parsed?.hitIndex) return undefined

  return st(type, {
    val: `$t(char_${charKey}_gen:${parsed.skill}.${parsed.abilityKey}.params.${parsed.hitIndex})`,
  })
}

/** Translated ability name for a formula tag. */
export function abilityDisplayTitle(
  charKey: CharacterKey,
  tag: Tag,
  skillOverride?: SkillKey
): ReactNode | undefined {
  const parsed = parseAbilityFromTag(tagForAbilityParse(tag, skillOverride))
  if (!parsed) return undefined
  const [chg] = trans('char', charKey)
  const skill = skillOverride ?? parsed.skill
  return chg(`${skill}.${parsed.abilityKey}.name`)
}

export function abilityTagDisplay(
  charKey: CharacterKey,
  tag: Tag,
  skillOverride?: SkillKey
): ReactNode | undefined {
  const hitLabel = abilityFormulaLabel(charKey, tag, skillOverride)
  if (hitLabel) return hitLabel

  const name = abilityDisplayTitle(charKey, tag, skillOverride)
  if (!name) return undefined

  if (tag.q && isAbilityDim(tag.q)) {
    return createElement('span', null, name, ' ', abilityDimTooltipLabel(tag.q))
  }
  return name
}

export function abilityDisplayNameString(
  charKey: CharacterKey,
  tag: Tag,
  skillOverride?: SkillKey
): string | undefined {
  const parsed = parseAbilityFromTag(tagForAbilityParse(tag, skillOverride))
  if (!parsed) return undefined
  const skill = skillOverride ?? parsed.skill
  const key = `${skill}.${parsed.abilityKey}.name`
  const translated = i18n.t(key, {
    ns: `char_${charKey}_gen`,
    defaultValue: '',
  })
  const base = translated || parsed.abilityKey
  if (tag.q && isAbilityDim(tag.q)) {
    return `${base} ${abilityDimTooltipLabel(tag.q)}`
  }
  return base
}
