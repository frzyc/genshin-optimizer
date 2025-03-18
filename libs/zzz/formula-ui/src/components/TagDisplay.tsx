import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import { ColorText, SqBadge } from '@genshin-optimizer/common/ui'
import type { StatKey } from '@genshin-optimizer/zzz/consts'
import { statKeyTextMap } from '@genshin-optimizer/zzz/consts'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { StatIcon } from '@genshin-optimizer/zzz/svgicons'
import { AttributeName, StatDisplay } from '@genshin-optimizer/zzz/ui'
import { damageTypeKeysMap, getDmgType, getVariant, tagFieldMap } from '../char'
import { getTagLabel } from '../util'
export function TagDisplay({ tag }: { tag: Tag }) {
  return (
    <ColorText color={getVariant(tag)}>
      <TagStrDisplay tag={tag} />
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
const qtMap = {
  initial: 'Initial',
  combat: 'Combat',
  final: 'Final',
  base: 'Base',
}
function TagStrDisplay({ tag }: { tag: Tag }) {
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
          {tag.sheet && tag.sheet !== 'agg' ? ` (${tag.sheet})` : ''}
        </span>
      </span>
    )

  return <StatDisplay statKey={label as StatKey} />
}
