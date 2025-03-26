import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import { ColorText, SqBadge } from '@genshin-optimizer/common/ui'
import { getUnitStr } from '@genshin-optimizer/common/util'
import type { StatKey } from '@genshin-optimizer/zzz/consts'
import { elementalData, statKeyTextMap } from '@genshin-optimizer/zzz/consts'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { StatIcon } from '@genshin-optimizer/zzz/svgicons'
import { AttributeName, StatDisplay } from '@genshin-optimizer/zzz/ui'
import { damageTypeKeysMap, getDmgType, getVariant, tagFieldMap } from '../char'
import { getTagLabel } from '../util'
import { qtMap } from './qtMap'
export function TagDisplay({
  tag,
  showPercent,
}: { tag: Tag; showPercent?: boolean }) {
  return (
    <ColorText color={getVariant(tag)}>
      <TagStrDisplay tag={tag} showPercent={showPercent} />
    </ColorText>
  )
}
export function FullTagDisplay({ tag }: { tag: Tag }) {
  return (
    <>
      <TagDisplay tag={tag} />
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
const labelMap = {
  // TODO: translation
  dmg_: 'DMG',
  common_dmg_: 'DMG',
  resIgn_: 'Res Ignore',
} as const
function TagStrDisplay({
  tag,
  showPercent,
}: { tag: Tag; showPercent?: boolean }) {
  const title = tagFieldMap.subset(tag)[0]?.title
  if (title) return title

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
