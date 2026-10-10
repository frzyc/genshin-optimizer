import {
  allArtifactSetKeys,
  allCharacterKeys,
  allWeaponKeys,
  type CharacterKey,
} from '@genshin-optimizer/gi/consts'
import type { Tag } from './data/util'
import { formulaCatalog } from './formulaCatalog'

/** Catalog/DB namespace for listing stats. Not a Pando sheet. */
export const STAT_SHEET = 'stat'

export type FormulaSheet =
  | CharacterKey
  | (typeof allWeaponKeys)[number]
  | (typeof allArtifactSetKeys)[number]
  | typeof STAT_SHEET

const formulaSheetSet = new Set<string>([
  STAT_SHEET,
  ...allCharacterKeys,
  ...allWeaponKeys,
  ...allArtifactSetKeys,
])

export function isFormulaSheet(
  sheet: string | null | undefined
): sheet is FormulaSheet {
  return !!sheet && formulaSheetSet.has(sheet)
}

export type FormulaRef = {
  sheet: FormulaSheet
  name: string
  dim: string
}

export type FormulaCatalogCategory =
  | 'auto'
  | 'skill'
  | 'burst'
  | 'sprint'
  | 'passive'
  | 'passive1'
  | 'passive2'
  | 'passive3'
  | 'constellation1'
  | 'constellation2'
  | 'constellation3'
  | 'constellation4'
  | 'constellation5'
  | 'constellation6'

export type FormulaCatalogEntry = {
  sheet: FormulaSheet
  name: string
  dims: Record<string, Tag>
  category?: FormulaCatalogCategory
  exposeInProd: boolean
}

export type FormulaCatalog = Partial<
  Record<FormulaSheet, Record<string, FormulaCatalogEntry>>
>

export type ResolvedFormulaRef = {
  ref: FormulaRef
  entry: FormulaCatalogEntry
  tag: Tag
}

/** Drop calc/runtime keys before catalog join or persistence. */
export function stripCalcContextTag(tag: Tag): Tag {
  const {
    src: _src,
    dst: _dst,
    preset: _preset,
    ...rest
  } = tag as Tag & {
    src?: string | null
    dst?: string | null
    preset?: string | null
  }
  return rest
}

/**
 * Join key for catalog dim tags vs live listFormulas Reads.
 * `ele` is listing identity when registration stamps it (shields, elemental
 * `dmg_`, skill/burst/`customDmg` with a fixed eleOverride). Infusion hits omit
 * it; resolved element lives on `prep.ele` / compute `meta.tag`.
 */
export function listingJoinId(tag: {
  sheet?: string | null
  name?: string | null
  q?: string | null
  qt?: string | null
  ele?: string | null
}): string {
  return `${tag.sheet ?? ''}:${tag.name ?? ''}:${tag.q ?? ''}:${tag.qt ?? ''}:${tag.ele ?? ''}`
}

/** Catalog identity: same `(sheet, name)`. Ignores dim. */
export function sameFormula(
  a: Pick<FormulaRef, 'sheet' | 'name'> | undefined,
  b: Pick<FormulaRef, 'sheet' | 'name'> | undefined
): boolean {
  return !!a && !!b && a.sheet === b.sheet && a.name === b.name
}

function catalogEntryForDim(
  ref: Pick<FormulaRef, 'sheet' | 'name'>,
  dim: string,
  catalog: FormulaCatalog
): FormulaCatalogEntry | undefined {
  const entry = catalog[ref.sheet]?.[ref.name]
  if (!entry || !(dim in entry.dims)) return undefined
  return entry
}

function resolveFormulaRef(
  sheet: FormulaSheet,
  name: string,
  dim: string,
  catalog: FormulaCatalog
): ResolvedFormulaRef | undefined {
  if (!name || !dim) return undefined
  const entry = catalogEntryForDim({ sheet, name }, dim, catalog)
  if (!entry) return undefined
  const ref: FormulaRef = { sheet, name, dim }
  return { ref, entry, tag: stripCalcContextTag(entry.dims[dim]!) }
}

export function lookupFormulaRef(
  ref: FormulaRef | undefined,
  catalog: FormulaCatalog = formulaCatalog
): ResolvedFormulaRef | undefined {
  if (!ref) return undefined
  return resolveFormulaRef(ref.sheet, ref.name, ref.dim, catalog)
}

export function validateFormulaRef(
  raw: unknown,
  catalog: FormulaCatalog = formulaCatalog
): FormulaRef | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const o = raw as Record<string, unknown>
  const sheet = typeof o['sheet'] === 'string' ? o['sheet'] : undefined
  const name = typeof o['name'] === 'string' ? o['name'] : undefined
  const dim = typeof o['dim'] === 'string' ? o['dim'] : undefined
  if (!sheet || !name || !dim || !isFormulaSheet(sheet)) return undefined
  return resolveFormulaRef(sheet, name, dim, catalog)?.ref
}

export function toTag(
  ref: FormulaRef | undefined,
  catalog: FormulaCatalog = formulaCatalog
): Tag | undefined {
  return lookupFormulaRef(ref, catalog)?.tag
}

export function withDim(
  ref: FormulaRef,
  dim: string,
  catalog: FormulaCatalog = formulaCatalog
): FormulaRef | undefined {
  if (!catalogEntryForDim(ref, dim, catalog)) return undefined
  return { ...ref, dim }
}
