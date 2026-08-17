import type { Tag } from '@genshin-optimizer/zzz/formula'
import { buildTagFieldMaps } from './buildTagFieldMaps'

let tagFieldMaps: ReturnType<typeof buildTagFieldMaps> | undefined

function ensureTagFieldMaps() {
  if (!tagFieldMaps) tagFieldMaps = buildTagFieldMaps()
  return tagFieldMaps
}

function tagForFieldMapLookup(tag: Tag): Tag {
  const { src, dst, preset, ...rest } = tag as Tag & {
    src?: string | null
    dst?: string | null
    preset?: string | null
  }
  return rest
}

export function tagFieldSubset(tag: Tag) {
  return ensureTagFieldMaps().tagFieldMap.subset(tagForFieldMapLookup(tag))
}

export function getCondMap() {
  return ensureTagFieldMaps().condMap
}
