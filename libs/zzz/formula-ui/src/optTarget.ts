import type { TargetTag } from '@genshin-optimizer/zzz/db'
import type { Tag } from '@genshin-optimizer/zzz/formula'

export function isOptTargetTag(
  tag: Tag,
  target: TargetTag | undefined
): boolean {
  if (!target) return false
  return (
    (tag.sheet === target.sheet && tag.name === target.name) ||
    target.q === tag.q
  )
}

/** Inset ring so opt-target rows show on striped `FieldDisplayList` rows. */
export const optTargetRowSx = {
  boxShadow: '0px 0px 0px 2px rgba(0, 200, 0, 0.55) inset',
} as const
