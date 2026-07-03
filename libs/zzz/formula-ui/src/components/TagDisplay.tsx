import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import { ColorText, SqBadge } from '@genshin-optimizer/common/ui'
import { evalIfFunc, getUnitStr } from '@genshin-optimizer/common/util'
import type { Calculator as GameOptCalculator } from '@genshin-optimizer/game-opt/engine'
import type {
  CharacterKey,
  SkillKey,
  StatKey,
} from '@genshin-optimizer/zzz/consts'
import {
  allCharacterKeys,
  elementalData,
  isSkillKey,
  statKeyTextMap,
} from '@genshin-optimizer/zzz/consts'
import {
  Read,
  type Tag,
  abilityBaseName,
  isAbilityDim,
} from '@genshin-optimizer/zzz/formula'
import { StatIcon } from '@genshin-optimizer/zzz/svgicons'
import { AttributeName, StatDisplay } from '@genshin-optimizer/zzz/ui'
import type { ReactNode } from 'react'
import { getCondMap, tagFieldSubset } from '../char/tagFieldMap'
import { damageTypeKeysMap, getDmgType, getVariant } from '../char/util'
import { dimensionByAbilityDim } from '../formulaDimensionUi'
import { useZzzCalcContext } from '../hooks'
import { getTagLabel, st } from '../util'
import { qtMap } from './qtMap'
export function TagDisplay({
  tag,
  showPercent,
  preventRecursion,
}: { tag: Tag; showPercent?: boolean; preventRecursion?: boolean }) {
  return (
    <ColorText color={getVariant(tag)}>
      <TagStrDisplay
        tag={tag}
        showPercent={showPercent}
        preventRecursion={preventRecursion}
      />
    </ColorText>
  )
}
export function FullTagDisplay({
  tag,
  showPercent,
}: { tag: Tag; showPercent?: boolean }) {
  return (
    <>
      <TagDisplay tag={tag} showPercent={showPercent} />
      {/* Show DMG type */}
      {getDmgType(tag).map((dmgType) => (
        <SqBadge key={dmgType}>{damageTypeKeysMap[dmgType]}</SqBadge>
      ))}
      {/* Show Attribute */}
      {tag.attribute && (
        <SqBadge color={tag.attribute}>
          {<AttributeName attribute={tag.attribute} />}
        </SqBadge>
      )}
    </>
  )
}
const extraHandlingStats = ['hp', 'hp_', 'atk', 'atk_', 'def', 'def_'] as const
const isExtraHandlingStats = (
  stat: string
): stat is (typeof extraHandlingStats)[number] =>
  extraHandlingStats.includes(
    stat as 'hp' | 'hp_' | 'atk' | 'atk_' | 'def' | 'def_'
  )
function abilityFormulaTitle(tag: Tag): ReactNode | undefined {
  if (!tag.sheet || !allCharacterKeys.includes(tag.sheet as CharacterKey))
    return undefined
  if (!tag.name || !isAbilityDim(tag.q)) return undefined
  if (!tag.skillType?.endsWith('Skill')) return undefined

  const skill = tag.skillType.slice(0, -'Skill'.length)
  if (!isSkillKey(skill)) return undefined

  const baseName = abilityBaseName(tag.name)
  const underscoreIdx = baseName.lastIndexOf('_')
  if (underscoreIdx === -1) return baseName

  const hitIndex = baseName.slice(underscoreIdx + 1)
  if (!/^\d+$/.test(hitIndex)) return baseName

  return st(dimensionByAbilityDim[tag.q], {
    val: `$t(char_${tag.sheet}_gen:${skill as SkillKey}.${baseName.slice(
      0,
      underscoreIdx
    )}.params.${hitIndex})`,
  })
}
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
function TagStrDisplay({
  tag,
  showPercent,
  preventRecursion,
}: { tag: Tag; showPercent?: boolean; preventRecursion?: boolean }) {
  const calc = useZzzCalcContext()
  const abilityTitle = abilityFormulaTitle(tag)
  if (abilityTitle) return abilityTitle

  const title = tagFieldSubset(tag)[0]?.title
  if (title && !preventRecursion) return title
  // Conditional label handling
  if (tag.qt === 'cond' && tag.q && tag.sheet && calc) {
    const cond = getCondMap().get(`${tag.sheet}:${tag.q}`)
    if (cond)
      return evalIfFunc(
        cond.label,
        calc as GameOptCalculator,
        calc?.compute(new Read(tag, 'max')).val
      )
  }
  const label = getTagLabel(tag)

  if (isExtraHandlingStats(label))
    return (
      <span>
        <StatIcon statKey={label} iconProps={iconInlineProps} />{' '}
        <span>
          {(tag.qt && qtMap[tag.qt as keyof typeof qtMap]) ?? tag.qt}{' '}
          {statKeyTextMap[label]}
          {showPercent && getUnitStr(label)}
          {/* {tag.sheet && tag.sheet !== 'agg' ? ` (${tag.sheet})` : ''} */}
        </span>
      </span>
    )
  if (labelMap[label as keyof typeof labelMap]) {
    const strs = [
      ...(tag.attribute ? [elementalData[tag.attribute]] : []),
      ...(tag.damageType1 ? [damageTypeKeysMap[tag.damageType1]] : []),
      ...(tag.damageType2 ? [damageTypeKeysMap[tag.damageType2]] : []),
      labelMap[label as keyof typeof labelMap],
    ]
    return <span>{strs.join(' ')}</span>
  }
  return <StatDisplay statKey={label as StatKey} showPercent={showPercent} />
}
