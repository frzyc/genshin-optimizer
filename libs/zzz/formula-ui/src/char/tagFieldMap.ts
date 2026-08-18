import type { Tag } from '@genshin-optimizer/zzz/formula'
import { stripCalcContextTag } from '@genshin-optimizer/zzz/formula'
import type { ReactNode } from 'react'
import { buildTagFieldMaps } from './buildTagFieldMaps'

let tagFieldMaps: ReturnType<typeof buildTagFieldMaps> | undefined

function ensureTagFieldMaps() {
  if (!tagFieldMaps) tagFieldMaps = buildTagFieldMaps()
  return tagFieldMaps
}

export function tagFieldSubset(tag: Tag) {
  return ensureTagFieldMaps().tagFieldMap.subset(stripCalcContextTag(tag))
}

/** Authored sheet / CharBase title for a tag, when one exists. */
export function tagFieldTitle(tag: Tag): ReactNode | undefined {
  return tagFieldSubset(tag)[0]?.title
}

export function getCondMap() {
  return ensureTagFieldMaps().condMap
}
