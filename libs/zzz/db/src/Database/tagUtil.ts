import { allCharacterKeys } from '@genshin-optimizer/zzz/consts'
import type { Tag } from '@genshin-optimizer/zzz/formula'

export function validateTag(tag: Tag) {
  // TODO: more tag validation
  if (typeof tag !== 'object') return false

  // TODO: REMOVE. this is a stopgap to invalid data since Read were stored where tags are now stored.
  if ((tag as any).tag) return false

  if (tag.src && !allCharacterKeys.includes(tag.src)) return false
  if (tag.dst && !allCharacterKeys.includes(tag.dst)) return false
  return true
}
