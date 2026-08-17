import {
  allCharacterKeys,
  type CharacterKey,
} from '@genshin-optimizer/zzz/consts'
import type { Sheet, Tag } from './data/util'
import {
  type AbilityDim,
  abilityDims,
  bundledFormulaInSheet,
  type DmgAbilityDim,
  isAbilityDim,
} from './formulaMeta'
import { formulas } from './meta'

/** using sheet+name as stable identity for hit grouping */
export function hitId(tag: Tag): string {
  return `${tag.sheet ?? ''}:${tag.name ?? ''}`
}

/** Stable listing identity for dedupe / Read lookup. */
export function listingId(tag: Tag): string {
  return `${tag.sheet ?? ''}:${tag.name ?? ''}:${tag.q ?? ''}:${tag.qt ?? ''}:${tag.attribute ?? ''}:${tag.damageType1 ?? ''}:${tag.damageType2 ?? ''}`
}

/** Drop calc/runtime keys before meta lookup, display, or persistence. */
export function stripCalcContextTag(tag: Tag): Tag {
  const { src, dst, preset, ...rest } = tag as Tag & {
    src?: string | null
    dst?: string | null
    preset?: string | null
  }
  return rest
}

function abilityDimSortIndex(q: string | null | undefined): number {
  if (!q) return abilityDims.length
  if (isAbilityDim(q)) return abilityDims.indexOf(q)
  return abilityDims.length
}

/** Stable tag order: sheet > name > abilityDims. */
export function compareAbilityHitTags(a: Tag, b: Tag): number {
  const sheetA = a.sheet ?? ''
  const sheetB = b.sheet ?? ''
  if (sheetA !== sheetB) return sheetA.localeCompare(sheetB)
  const nameA = a.name ?? ''
  const nameB = b.name ?? ''
  if (nameA !== nameB) return nameA.localeCompare(nameB)
  const qOrd = abilityDimSortIndex(a.q) - abilityDimSortIndex(b.q)
  if (qOrd) return qOrd
  return (a.q ?? '').localeCompare(b.q ?? '')
}

export function sortAbilityHitTags(tags: Tag[]): Tag[] {
  return [...tags].sort(compareAbilityHitTags)
}

export function resolveBundleDmgQ(
  byQ: Map<string, Tag>
): DmgAbilityDim | undefined {
  if (byQ.has('standardDmg')) return 'standardDmg'
  if (byQ.has('sheerDmg')) return 'sheerDmg'
  return undefined
}

function isCompleteAbilityBundle(byQ: Map<string, Tag>): boolean {
  if (byQ.has('standardDmg') && byQ.has('sheerDmg')) return false
  const dmgQ = resolveBundleDmgQ(byQ)
  return !!dmgQ && byQ.has('dazeBuildup') && byQ.has('anomBuildup')
}

export type AbilityHitPart =
  | { kind: 'single'; tag: Tag }
  | { kind: 'bundle'; byQ: Map<string, Tag>; dmgQ: DmgAbilityDim }

/** Group ability-dim tags into bundled hits or singles. */
export function partitionAbilityHits(
  tags: Tag[],
  sheet?: Sheet
): AbilityHitPart[] {
  const withSheet = (tag: Tag): Tag =>
    sheet && !tag.sheet ? { ...tag, sheet } : tag
  const sortedTags = sortAbilityHitTags(tags.map(withSheet))

  const byHitId = new Map<string, Tag[]>()
  const nonAbility: Tag[] = []

  for (const tag of sortedTags) {
    const { name, q } = tag
    if (!name || !isAbilityDim(q)) {
      nonAbility.push(tag)
      continue
    }
    const key = hitId(tag)
    const group = byHitId.get(key) ?? []
    group.push(tag)
    byHitId.set(key, group)
  }

  const parts: AbilityHitPart[] = []
  for (const tag of nonAbility) parts.push({ kind: 'single', tag })

  const seenHits = new Set<string>()
  for (const tag of sortedTags) {
    const { name, q } = tag
    if (!name || !isAbilityDim(q)) continue
    const key = hitId(tag)
    if (seenHits.has(key)) continue
    seenHits.add(key)

    const group = byHitId.get(key) ?? []
    const byQ = new Map<string, Tag>()
    for (const t of group) {
      const rq = t.q
      if (isAbilityDim(rq)) byQ.set(rq, t)
    }

    const dmgQ = resolveBundleDmgQ(byQ)
    if (dmgQ && isCompleteAbilityBundle(byQ)) {
      parts.push({ kind: 'bundle', byQ, dmgQ })
    } else {
      for (const t of group) parts.push({ kind: 'single', tag: t })
    }
  }

  return parts
}

export type FormulaLookup = {
  sheet: Sheet
  name: string
  tag: Tag
}

function sheetFormulasFor(sheet: Sheet | string) {
  return (formulas as Record<string, Record<string, FormulaLookup>>)[sheet]
}

function matchesFormula(
  charSheet: string,
  name: string,
  q: string | undefined
): boolean {
  const sheetFormulas = sheetFormulasFor(charSheet)
  if (!sheetFormulas) return false
  if (q) {
    if (isAbilityDim(q))
      return !!bundledFormulaInSheet(sheetFormulas, name, q as AbilityDim)
    return Object.values(sheetFormulas).some(
      (entry) => entry.tag?.name === name && entry.tag?.q === q
    )
  }
  return !!sheetFormulas[name]
}

/** Resolve which character sheet owns a named formula target. */
export function resolveFormulaSheet(target: {
  sheet?: string
  name?: string
  q?: string
}): Sheet | undefined {
  const { name, q, sheet } = target
  if (!name) return undefined

  if (
    sheet &&
    allCharacterKeys.includes(sheet as CharacterKey) &&
    matchesFormula(sheet, name, q)
  )
    return sheet as Sheet

  let resolved: Sheet | undefined
  for (const charSheet of allCharacterKeys) {
    if (!matchesFormula(charSheet, name, q)) continue
    if (resolved) return undefined
    resolved = charSheet as Sheet
  }
  return resolved
}

/** Resolve a formula listing entry by persisted target key. */
export function lookupFormulaEntry(target: {
  sheet?: string
  name?: string
  q?: string
}): FormulaLookup | undefined {
  const { name, q, sheet: sheetHint } = target
  if (!name) return undefined
  const sheet = (sheetHint ?? resolveFormulaSheet(target)) as Sheet | undefined
  if (!sheet) return undefined
  const sheetFormulas = sheetFormulasFor(sheet)
  if (!sheetFormulas) return undefined

  if (q) {
    if (isAbilityDim(q)) {
      const entry = bundledFormulaInSheet(sheetFormulas, name, q)
      if (entry) return { sheet, name: entry.name, tag: entry.tag }
    }
    const byTagQ = Object.values(sheetFormulas).find(
      (entry) => entry.tag?.name === name && entry.tag?.q === q
    )
    if (byTagQ) return { sheet, name: byTagQ.name, tag: byTagQ.tag }
    return undefined
  }

  const bare = sheetFormulas[name]
  if (bare) return { sheet, name: bare.name, tag: bare.tag }
  return undefined
}
