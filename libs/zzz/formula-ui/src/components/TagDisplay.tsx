import { SqBadge } from '@genshin-optimizer/common/ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { AttributeName } from '@genshin-optimizer/zzz/ui'
import { damageTypeKeysMap, getDmgType } from '../char/util'
import { TagTitle } from './TagTitle'

export function TagDisplay({
  tag,
  showPercent,
}: {
  tag: Tag
  showPercent?: boolean
}) {
  return <TagTitle tag={tag} showPercent={showPercent} includeCond />
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
