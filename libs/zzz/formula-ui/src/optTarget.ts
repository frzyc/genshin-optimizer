import type {
  Tag as GameOptTag,
  Read,
} from '@genshin-optimizer/game-opt/engine'
import type { Field, MultiTagField } from '@genshin-optimizer/game-opt/sheet-ui'
import type { BaseRead } from '@genshin-optimizer/pando/engine'
import { read as tagRead } from '@genshin-optimizer/pando/engine'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
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
import { optTargetQFromField } from './formulaFieldUtil'

function isNamedFormulaListingTag(tag: Tag): boolean {
  return tag.qt === 'formula' && !!tag.name
}

function lookupListingRead(
  tag: Tag,
  readByListingKey: Map<string, Read<Tag>>
): Read<Tag> | undefined {
  const listingTag = stripCalcContextTag(tag)
  const direct = readByListingKey.get(listingId(listingTag))
  if (direct) return direct

  const hasInstDamageOverride =
    isNamedFormulaListingTag(listingTag) &&
    isGenericDmgInstTarget(listingTag.name ?? undefined) &&
    !!(listingTag.damageType1 || listingTag.damageType2)
  if (!hasInstDamageOverride) return undefined

  const { damageType1: _, damageType2: __, ...baseTag } = listingTag
  const baseRead = readByListingKey.get(listingId(baseTag))
  if (!baseRead) {
    console.error(
      '[zzz-formula-ui] lookupListingRead: generic inst base read missing after damage-type override',
      { tag: listingTag, baseTag }
    )
  }
  return baseRead
}

function readWithMergedTag(read: BaseRead | Read<Tag>, tag: Tag): Read<Tag> {
  if (typeof (read as Read<Tag>).withTag === 'function') {
    return (read as Read<Tag>).withTag(tag)
  }
  return { ...read, tag: { ...read.tag, ...tag } } as Read<Tag>
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
    const match = lookupListingRead(listingTag, readByListingKey)
    if (!match) return undefined
    return readWithMergedTag(match, tag)
  }
  if (readByListingKey) {
    const match = lookupListingRead(listingTag, readByListingKey)
    if (match) return readWithMergedTag(match, tag)
  }
  return tagRead(tag) as Read<Tag>
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

/** Drop bundled dims with no live listing read (static meta vs calc gating). */
export function mergeMultiTagFieldForDisplay(
  field: MultiTagField,
  readByListingKey: Map<string, Read<Tag>>,
  resolvedOptTag: Tag | undefined,
  optTarget: TargetTag | undefined
):
  | { field: MultiTagField; getRead: (tag: GameOptTag) => Read<Tag> }
  | undefined {
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
      const read = readMap.get(listingId(tag as Tag))
      if (!read) {
        throw new Error(
          `[zzz-formula-ui] mergeMultiTagFieldForDisplay: missing read for ${listingId(tag as Tag)}`
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
