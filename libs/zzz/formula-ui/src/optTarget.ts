import type { Read } from '@genshin-optimizer/game-opt/engine'
import type { Field, MultiTagField } from '@genshin-optimizer/game-opt/sheet-ui'
import type { BaseRead } from '@genshin-optimizer/pando/engine'
import { read as tagRead } from '@genshin-optimizer/pando/engine'
import type {
  AttributeKey,
  CharacterKey,
  StatKey,
} from '@genshin-optimizer/zzz/consts'
import {
  isGenericDmgInstTarget,
  resolveTargetTag,
  type TargetTag,
} from '@genshin-optimizer/zzz/db'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import {
  hitId,
  listingId,
  stripCalcContextTag,
} from '@genshin-optimizer/zzz/formula'
import { optTargetQFromField, primaryTagFromField } from './formulaFieldUtil'

function readWithMergedTag(read: BaseRead | Read<Tag>, tag: Tag): Read<Tag> {
  if (typeof (read as Read<Tag>).withTag === 'function') {
    return (read as Read<Tag>).withTag(tag)
  }
  return { ...read, tag: { ...read.tag, ...tag } } as Read<Tag>
}

/** Named formula listing row (`qt: 'formula'` with `name`). */
export function isNamedFormulaListingTag(tag: Tag): boolean {
  return tag.qt === 'formula' && !!tag.name
}

/** Resolve a listing `Read` for debug / compute. */
export function formulaReadForTag(
  tag: Tag,
  readByListingKey?: Map<string, Read<Tag>>
): Read<Tag> | undefined {
  const listingTag = stripCalcContextTag(tag)
  if (isNamedFormulaListingTag(listingTag)) {
    if (!readByListingKey) {
      console.error(
        '[zzz-formula-ui] formulaReadForTag: named formula without listing read map',
        { tag: listingTag }
      )
      return undefined
    }
    const match = readByListingKey.get(listingId(listingTag))
    if (!match) return undefined
    return readWithMergedTag(match, tag)
  }
  if (readByListingKey) {
    const match = readByListingKey.get(listingId(listingTag))
    if (match) return readWithMergedTag(match, tag)
  }
  return tagRead(tag) as Read<Tag>
}

/** Named formula instances (`standardDmgInst`, etc.) use `qt: 'formula'`. */
export function isListingStatTag(tag: Tag): boolean {
  return !!(tag.q && tag.qt && !tag.name && tag.qt !== 'formula')
}

export function statReadTagKey(tag: Tag): string {
  return `${tag.qt ?? ''}:${tag.q ?? ''}:${tag.attribute ?? ''}`
}

/** Stat highlight key for listing stat rows (not named formula hits). */
export function statKeyFromListingTag(tag: Tag): StatKey | '' {
  if (tag.name) return ''
  if (tag.attribute) return `${tag.attribute}_${tag.q}` as StatKey
  if (tag.q === 'cappedCrit_') return 'crit_'
  if (tag.q === 'anom_cappedCrit_') return 'anom_crit_'
  return (tag.q ?? '') as StatKey
}

/** Stat rows from `calc.listFormulas(own.listing.formulas)` (per-char util listing). */
export function listStatReadsFromFormulas(reads: Read<Tag>[]): Read<Tag>[] {
  const seen = new Set<string>()
  const result: Read<Tag>[] = []
  for (const read of reads) {
    if (!isListingStatTag(read.tag)) continue
    if (read.tag.q === 'dmg_' && read.tag.attribute === 'lumiflux') continue
    const key = statReadTagKey(read.tag)
    if (seen.has(key)) continue
    seen.add(key)
    result.push(read)
  }
  return result
}

export function statReadToTargetTag(read: Read<Tag>): TargetTag {
  const { q, qt, attribute } = read.tag
  if (!q || !qt) throw new Error('invalid stat read')
  return {
    q: q as TargetTag['q'],
    qt: qt as TargetTag['qt'],
    ...(attribute ? { attribute: attribute as AttributeKey } : {}),
  }
}

/** Drop formula-listing stat rows already shown under the Stats heading. */
export function filterNonStatFields(fields: Field[]): Field[] {
  return fields.filter((field) => {
    const tag = primaryTagFromField(field)
    return !tag || !isListingStatTag(tag)
  })
}

/** Drop named formula rows that cannot be persisted as an opt target. */
export function filterSelectableOptTargetFields(
  charKey: CharacterKey,
  fields: Field[]
): Field[] {
  return fields.filter(
    (field) => !!optTargetQFromField(field, undefined, charKey)
  )
}

export function isOptTargetTag(
  tag: Tag,
  target: TargetTag | undefined,
  resolvedTag?: Tag
): boolean {
  if (!target) return false
  if (!target.name && target.q && target.qt) {
    return (
      target.q === tag.q &&
      target.qt === tag.qt &&
      (target.attribute ?? undefined) === (tag.attribute ?? undefined)
    )
  }
  const resolved = resolvedTag ?? resolveTargetTag(target)
  if (!resolved) return false
  if (target.name && isGenericDmgInstTarget(target.name)) {
    return listingId(tag) === listingId(resolved)
  }
  return hitId(tag) === hitId(resolved)
}

/** Use resolved generic-inst tag for compute/highlight on the selected row only. */
/** Drop bundled dims with no live listing read (static meta vs calc gating). */
export function mergeMultiTagFieldForDisplay(
  field: MultiTagField,
  readByListingKey: Map<string, Read<Tag>>,
  resolvedOptTag: Tag | undefined,
  optTarget: TargetTag | undefined
): { field: MultiTagField; getRead: (tag: Tag) => Read<Tag> } | undefined {
  const readMap = new Map<string, Read<Tag>>()
  const fieldRefs: MultiTagField['fieldRefs'] = []

  for (const { label, ref } of field.fieldRefs) {
    const mergedRef = mergeTagForOpt(ref as Tag, resolvedOptTag, optTarget)
    const calcRead = formulaReadForTag(mergedRef, readByListingKey)
    if (!calcRead) continue
    readMap.set(listingId(mergedRef), calcRead)
    fieldRefs.push({ label, ref: mergedRef })
  }

  if (!fieldRefs.length) return undefined

  return {
    field: { ...field, fieldRefs },
    getRead: (tag) => {
      const read = readMap.get(listingId(tag))
      if (!read) {
        throw new Error(
          `[zzz-formula-ui] mergeMultiTagFieldForDisplay: missing read for ${listingId(tag)}`
        )
      }
      return read
    },
  }
}

export function mergeTagForOpt(
  tag: Tag,
  resolvedOptTag: Tag | undefined,
  optTarget: TargetTag | undefined
): Tag {
  const rowTag = stripCalcContextTag(tag)
  if (!optTarget?.name || !isGenericDmgInstTarget(optTarget.name)) return rowTag
  if (!resolvedOptTag) return rowTag
  const targetSheet = optTarget.sheet
  if (!targetSheet) return rowTag
  if (
    rowTag.name === optTarget.name &&
    rowTag.q === optTarget.q &&
    rowTag.sheet === targetSheet
  )
    return stripCalcContextTag(resolvedOptTag)
  return rowTag
}
