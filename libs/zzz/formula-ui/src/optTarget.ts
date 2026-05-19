import { type TargetTag, targetTag } from '@genshin-optimizer/zzz/db'
import type { Tag } from '@genshin-optimizer/zzz/formula'

export function isOptTargetTag(
  tag: Tag,
  target: TargetTag | undefined,
  resolvedTag?: Tag
): boolean {
  if (!target) return false
  if (target.q && target.qt) return target.q === tag.q && target.qt === tag.qt
  const resolved = resolvedTag ?? targetTag(target)
  return (
    tag.sheet === resolved.sheet &&
    tag.name === resolved.name &&
    tag.q === resolved.q
  )
}

/** Inset ring so opt-target rows show on striped `FieldDisplayList` rows. */
export const optTargetRowSx = {
  boxShadow: '0px 0px 0px 2px rgba(0, 200, 0, 0.55) inset',
} as const
