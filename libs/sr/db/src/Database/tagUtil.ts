import { allCharacterKeys } from '@genshin-optimizer/sr/consts'
import type { Tag } from '@genshin-optimizer/sr/formula'

export function validateTag(tag: Tag) {
  // TODO: more tag validation
  if (typeof tag !== 'object') return false

  if (tag.src && !allCharacterKeys.includes(tag.src)) return false
  if (tag.dst && !allCharacterKeys.includes(tag.dst)) return false
  return true
}
