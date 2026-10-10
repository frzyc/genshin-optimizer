import { ColorText, SqBadge } from '@genshin-optimizer/common/ui'
import type { Tag } from '@genshin-optimizer/gi/formula'
import type { Palette } from '@mui/material'
import { isValidElement } from 'react'
import { tagFieldSubset } from '../char/tagFieldMap'
import { elementBadgeLabel, moveBadgeLabel, tagTitleColor } from '../tagLabel'
import { TagLabel } from './TagLabel'

function authoredSheetTitle(tag: Tag) {
  for (const field of tagFieldSubset(tag)) {
    const title = field.title
    if (title == null || (isValidElement(title) && title.type === TagDisplay))
      continue
    return title
  }
  return undefined
}

/** Unified tag → label for field rows, formula text, and catalog titles. */
export function TagDisplay({
  tag,
  plain,
}: {
  tag: Tag
  /** Skip ColorText; FieldDisplay applies `TagTitleColorContext`. */
  plain?: boolean
}) {
  const authored = authoredSheetTitle(tag)
  const inner = authored ?? <TagLabel tag={tag} />
  if (plain) return inner
  const color = tagTitleColor(tag)
  return <ColorText color={color}>{inner}</ColorText>
}

/** Tooltip header: title plus move-type and element badges (ZZZ `FullTagDisplay`). */
export function FullTagDisplay({ tag }: { tag: Tag; showPercent?: boolean }) {
  const move = tag.move
  const ele = tag.ele
  return (
    <>
      <TagDisplay tag={tag} />
      {move && <SqBadge>{moveBadgeLabel(move)}</SqBadge>}
      {ele && (
        <SqBadge color={ele as keyof Palette}>{elementBadgeLabel(ele)}</SqBadge>
      )}
    </>
  )
}
