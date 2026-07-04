import type { Read } from '@genshin-optimizer/game-opt/engine'
import type { Field } from '@genshin-optimizer/game-opt/sheet-ui'
import type { BaseRead } from '@genshin-optimizer/pando/engine'
import { read as tagRead } from '@genshin-optimizer/pando/engine'
import type { AttributeKey } from '@genshin-optimizer/zzz/consts'
import {
  type TargetTag,
  applyDamageTypeToTag,
  isGenericDmgInstTarget,
  targetTag,
} from '@genshin-optimizer/zzz/db'
import type { Calculator, Tag } from '@genshin-optimizer/zzz/formula'
import { own } from '@genshin-optimizer/zzz/formula'
import { primaryTagFromField } from './bundledFormulaFields'
import { abilityFormulaGroupKey } from './bundledFormulaGrouping'

function listingTagKey(tag: Tag): string {
  return `${tag.sheet ?? ''}:${tag.name ?? ''}:${tag.q ?? ''}:${tag.qt ?? ''}:${tag.attribute ?? ''}:${tag.damageType1 ?? ''}:${tag.damageType2 ?? ''}`
}

/** Key for looking up a listing `Read` from `calc.listFormulas(own.listing.formulas)`. */
export function listingReadKey(tag: Tag): string {
  return listingTagKey(tag)
}

export function buildListingReadMap(
  reads: Read<Tag>[]
): Map<string, Read<Tag>> {
  const map = new Map<string, Read<Tag>>()
  for (const read of reads) {
    map.set(listingTagKey(read.tag), read)
  }
  return map
}

function readWithMergedTag(read: BaseRead | Read<Tag>, tag: Tag): Read<Tag> {
  if (typeof (read as Read<Tag>).withTag === 'function') {
    return (read as Read<Tag>).withTag(tag)
  }
  return { ...read, tag: { ...read.tag, ...tag } } as Read<Tag>
}

/** Resolve a listing `Read` for debug / compute (prefers `own.listing.formulas`). */
export function formulaReadForTag(
  calc: Calculator | null | undefined,
  tag: Tag,
  listingRead?: BaseRead | Read<Tag>,
  readByListingKey?: Map<string, Read<Tag>>
): Read<Tag> {
  if (listingRead) return readWithMergedTag(listingRead, tag)
  if (readByListingKey) {
    const match = readByListingKey.get(listingTagKey(tag))
    if (match) return match.withTag(tag)
  }
  if (calc) {
    const key = listingTagKey(tag)
    const match = calc
      .listFormulas(own.listing.formulas)
      .find((read) => listingTagKey(read.tag) === key)
    if (match) return match.withTag(tag)
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

/** Stat rows from `calc.listFormulas(own.listing.formulas)` (per-char util listing). */
export function listStatReadsFromFormulas(reads: Read<Tag>[]): Read<Tag>[] {
  const seen = new Set<string>()
  const result: Read<Tag>[] = []
  for (const read of reads) {
    if (!isListingStatTag(read.tag)) continue
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
  const resolved = resolvedTag ?? targetTag(target)
  if (
    tag.sheet !== resolved.sheet ||
    tag.name !== resolved.name ||
    tag.q !== resolved.q ||
    (tag.qt ?? undefined) !== (resolved.qt ?? undefined) ||
    (tag.attribute ?? undefined) !== (resolved.attribute ?? undefined) ||
    abilityFormulaGroupKey(tag) !== abilityFormulaGroupKey(resolved)
  )
    return false
  if (target.name && isGenericDmgInstTarget(target.name)) {
    return (
      (tag.damageType1 ?? undefined) === (resolved.damageType1 ?? undefined) &&
      (tag.damageType2 ?? undefined) === (resolved.damageType2 ?? undefined)
    )
  }
  return true
}

/** Merge opt-target inst overrides onto a matching stat row tag for compute/highlight. */
export function mergeTagForOpt(
  tag: Tag,
  resolvedOptTag: Tag | undefined,
  optTarget: TargetTag | undefined
): Tag {
  if (
    !resolvedOptTag ||
    tag.sheet !== resolvedOptTag.sheet ||
    tag.name !== resolvedOptTag.name ||
    tag.q !== resolvedOptTag.q
  )
    return tag

  if (optTarget?.name && isGenericDmgInstTarget(optTarget.name)) {
    return applyDamageTypeToTag(
      tag,
      optTarget.damageType1,
      optTarget.damageType2
    )
  }

  if (abilityFormulaGroupKey(tag) !== abilityFormulaGroupKey(resolvedOptTag))
    return tag

  return tag
}

/** Inset ring so opt-target rows show on striped `FieldDisplayList` rows. */
export const optTargetRowSx = {
  boxShadow: '0px 0px 0px 2px rgba(0, 200, 0, 0.55) inset',
} as const
