import { ColorText, SqBadge } from '@genshin-optimizer/common/ui'
import { evalIfFunc } from '@genshin-optimizer/common/util'
import type { Calculator as GameOptCalculator } from '@genshin-optimizer/game-opt/engine'
import { Read, type Tag } from '@genshin-optimizer/zzz/formula'
import { stripCalcContextTag } from '@genshin-optimizer/zzz/formula'
import { AttributeName } from '@genshin-optimizer/zzz/ui'
import { getCondMap, tagFieldSubset } from '../char/tagFieldMap'
import { damageTypeKeysMap, getDmgType, getVariant } from '../char/util'
import { useZzzCalcContext } from '../hooks/useZzzCalcContext'
import { TagFallbackLabel } from './TagFallbackLabel'

export function TagDisplay({
  tag,
  showPercent,
}: {
  tag: Tag
  showPercent?: boolean
}) {
  return (
    <ColorText color={getVariant(tag)}>
      <TagStrDisplay tag={tag} showPercent={showPercent} />
    </ColorText>
  )
}

export function FullTagDisplay({
  tag,
  showPercent,
}: {
  tag: Tag
  showPercent?: boolean
}) {
  return (
    <>
      <TagDisplay tag={tag} showPercent={showPercent} />
      {getDmgType(tag).map((dmgType) => (
        <SqBadge key={dmgType}>{damageTypeKeysMap[dmgType]}</SqBadge>
      ))}
      {tag.attribute && (
        <SqBadge color={tag.attribute}>
          {<AttributeName attribute={tag.attribute} />}
        </SqBadge>
      )}
    </>
  )
}

function TagStrDisplay({
  tag,
  showPercent,
}: {
  tag: Tag
  showPercent?: boolean
}) {
  const calc = useZzzCalcContext()
  const listingTag = stripCalcContextTag(tag)

  const ownedTitle =
    listingTag.qt !== 'formula'
      ? tagFieldSubset(listingTag)[0]?.title
      : undefined
  if (ownedTitle) return ownedTitle

  if (tag.qt === 'cond' && tag.q && tag.sheet && calc) {
    const cond = getCondMap().get(`${tag.sheet}:${tag.q}`)
    if (cond)
      return evalIfFunc(
        cond.label,
        calc as GameOptCalculator,
        calc?.compute(new Read(tag, 'max')).val
      )
  }

  return <TagFallbackLabel tag={tag} showPercent={showPercent} />
}
