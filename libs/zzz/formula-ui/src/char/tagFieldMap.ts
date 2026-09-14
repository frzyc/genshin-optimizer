import type { Tag } from '@genshin-optimizer/zzz/formula'
import { stripCalcContextTag } from '@genshin-optimizer/zzz/formula'
import { buildTagFieldMaps } from './buildTagFieldMaps'

let tagFieldMaps: ReturnType<typeof buildTagFieldMaps> | undefined

function ensureTagFieldMaps() {
  if (!tagFieldMaps) tagFieldMaps = buildTagFieldMaps()
  return tagFieldMaps
}

export function tagFieldSubset(tag: Tag) {
  return ensureTagFieldMaps().tagFieldMap.subset(stripCalcContextTag(tag))
}

export function getCondMap() {
  return ensureTagFieldMaps().condMap
}
