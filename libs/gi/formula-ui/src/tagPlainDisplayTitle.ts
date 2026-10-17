import type { Tag } from '@genshin-optimizer/gi/formula'
import { tagFieldSubset } from './char/tagFieldMap'
import {
  catalogListingDisplayTitle,
  elementBadgeLabel,
  getTagLabel,
  moveBadgeLabel,
  tagLabelStr,
} from './tagLabel'

/** Plain English (or sheet-authored) title for a tag — mirrors `TagDisplay` / `TagLabel`. */
export function tagPlainDisplayTitle(tag: Tag): string {
  for (const field of tagFieldSubset(tag)) {
    if (typeof field.title === 'string') return field.title
  }
  const key = getTagLabel(tag)
  const mapped = tagLabelStr(key)
  if (mapped) return mapped
  if (tag.name) return catalogListingDisplayTitle(tag.name)
  return key
}

export function tagPlainDisplaySearchParts(tag: Tag): string[] {
  const parts = [tagPlainDisplayTitle(tag)]
  if (tag.move) parts.push(moveBadgeLabel(tag.move))
  if (tag.ele) parts.push(elementBadgeLabel(tag.ele))
  if (tag.name) parts.push(catalogListingDisplayTitle(tag.name))
  return parts
}
