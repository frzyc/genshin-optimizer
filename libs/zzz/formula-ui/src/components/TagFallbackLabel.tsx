import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import { getUnitStr } from '@genshin-optimizer/common/util'
import type { CharacterKey, StatKey } from '@genshin-optimizer/zzz/consts'
import {
  allCharacterKeys,
  elementalData,
  statKeyTextMap,
} from '@genshin-optimizer/zzz/consts'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { StatIcon } from '@genshin-optimizer/zzz/svgicons'
import { StatDisplay } from '@genshin-optimizer/zzz/ui'
import { abilityTagDisplay } from '../char/abilityFormulaLabels'
import { damageTypeKeysMap } from '../char/util'
import { statKeyFromListingTag } from '../optTarget'
import { getTagLabel, warnUnresolvedTagLabel } from '../tagLabel'
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
  const abilityTitle =
    tag.sheet && allCharacterKeys.includes(tag.sheet as CharacterKey)
      ? abilityTagDisplay(tag.sheet as CharacterKey, tag)
      : undefined
  if (abilityTitle) return abilityTitle

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
    const strs = [
      ...(tag.attribute ? [elementalData[tag.attribute]] : []),
      ...(tag.damageType1 ? [damageTypeKeysMap[tag.damageType1]] : []),
      ...(tag.damageType2 ? [damageTypeKeysMap[tag.damageType2]] : []),
      labelMap[labelMapKey as keyof typeof labelMap],
    ]
    return <span>{strs.join(' ')}</span>
  }

  const displayStatKey = (statKeyFromListingTag(tag) || label) as StatKey
  if (statKeyTextMap[displayStatKey]) {
    return <StatDisplay statKey={displayStatKey} showPercent={showPercent} />
  }

  warnUnresolvedTagLabel(tag, label)
  return <StatDisplay statKey={label as StatKey} showPercent={showPercent} />
}
