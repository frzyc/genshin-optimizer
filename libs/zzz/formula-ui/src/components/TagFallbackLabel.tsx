import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import {
  getUnitStr,
  shouldShowDevComponents,
} from '@genshin-optimizer/common/util'
import type { CharacterKey, StatKey } from '@genshin-optimizer/zzz/consts'
import {
  allCharacterKeys,
  elementalData,
  statKeyTextMap,
} from '@genshin-optimizer/zzz/consts'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { isAbilityDim } from '@genshin-optimizer/zzz/formula'
import { StatIcon } from '@genshin-optimizer/zzz/svgicons'
import { StatDisplay } from '@genshin-optimizer/zzz/ui'
import { isAbilityFormulaTag } from '../abilityTag'
import { AbilityRowTitle } from '../char/abilityFormulaLabels'
import {
  getTagLabel,
  namedAbilityDimLabel,
  tagQualifierLabel,
  warnUnresolvedTagLabel,
} from '../tagLabel'
import { qtMap } from './qtMap'

const extraHandlingStats = ['hp', 'hp_', 'atk', 'atk_', 'def', 'def_'] as const
const isExtraHandlingStats = (
  stat: string
): stat is (typeof extraHandlingStats)[number] =>
  extraHandlingStats.includes(
    stat as 'hp' | 'hp_' | 'atk' | 'atk_' | 'def' | 'def_'
  )

const labelMap = {
  // TODO: translation
  dmg_: 'DMG',
  common_dmg_: 'DMG',
  defIgn_: 'DEF Ignore',
  resIgn_: 'Res Ignore',
  dazeInc_: 'Daze Increase',
  buff_: 'Buff Bonus',
  sheer_dmg_: 'Sheer DMG',
} as const

function baseStatLabel(q: string): string | undefined {
  return statKeyTextMap[q] ?? labelMap[q as keyof typeof labelMap] ?? undefined
}

function renderAttributedBaseStat(
  tag: Tag,
  baseQ: string,
  baseLabel: string,
  showPercent?: boolean
) {
  return (
    <span>
      {isExtraHandlingStats(baseQ as (typeof extraHandlingStats)[number]) && (
        <StatIcon statKey={baseQ as StatKey} iconProps={iconInlineProps} />
      )}{' '}
      <span>
        {(tag.qt && qtMap[tag.qt as keyof typeof qtMap]) ?? tag.qt}{' '}
        {tagQualifierLabel(tag, baseLabel)}
        {showPercent && getUnitStr(baseQ as StatKey)}
      </span>
    </span>
  )
}

function attributedLabelFromCompositeKey(
  label: string,
  tag: Tag
): { baseQ: string; baseLabel: string; tag: Tag } | undefined {
  const sep = label.indexOf('_')
  if (sep <= 0) return undefined
  const attribute = label.slice(0, sep)
  const baseQ = label.slice(sep + 1)
  if (!(attribute in elementalData)) return undefined
  const baseLabel = baseStatLabel(baseQ)
  if (!baseLabel) return undefined
  return {
    baseQ,
    baseLabel,
    tag: { ...tag, attribute: attribute as Tag['attribute'], q: baseQ },
  }
}

/**
 * Owned fallback label for a tag — ability i18n / stats / formula keys.
 * Does not read `tagFieldMap` (safe for sheet field titles that are stored in the map).
 */
export function TagFallbackLabel({
  tag,
  showPercent,
}: {
  tag: Tag
  showPercent?: boolean
}) {
  if (
    tag.sheet &&
    allCharacterKeys.includes(tag.sheet as CharacterKey) &&
    isAbilityFormulaTag(tag)
  ) {
    return <AbilityRowTitle charKey={tag.sheet as CharacterKey} tag={tag} />
  }

  if (tag.name && tag.q && isAbilityDim(tag.q)) {
    const label = namedAbilityDimLabel(tag)
    if (label) return <span>{label}</span>
  }

  const label = getTagLabel(tag)
  const labelMapKey = tag.attribute ? (tag.q ?? label) : label

  if (isExtraHandlingStats(label))
    return (
      <span>
        <StatIcon statKey={label} iconProps={iconInlineProps} />{' '}
        <span>
          {(tag.qt && qtMap[tag.qt as keyof typeof qtMap]) ?? tag.qt}{' '}
          {statKeyTextMap[label]}
          {showPercent && getUnitStr(label)}
        </span>
      </span>
    )
  if (labelMap[labelMapKey as keyof typeof labelMap]) {
    return (
      <span>
        {tagQualifierLabel(tag, labelMap[labelMapKey as keyof typeof labelMap])}
      </span>
    )
  }

  const attributedBaseQ = tag.attribute ? tag.q : undefined
  if (attributedBaseQ) {
    const baseLabel = baseStatLabel(attributedBaseQ)
    if (baseLabel) {
      return renderAttributedBaseStat(
        tag,
        attributedBaseQ,
        baseLabel,
        showPercent
      )
    }
  }

  const composite = attributedLabelFromCompositeKey(label, tag)
  if (composite) {
    return renderAttributedBaseStat(
      composite.tag,
      composite.baseQ,
      composite.baseLabel,
      showPercent
    )
  }

  const displayStatKey = label as StatKey
  if (statKeyTextMap[displayStatKey]) {
    return <StatDisplay statKey={displayStatKey} showPercent={showPercent} />
  }

  warnUnresolvedTagLabel(tag, label)
  if (shouldShowDevComponents) return null
  return <StatDisplay statKey={label as StatKey} showPercent={showPercent} />
}
