import type { Tag } from './data/util'
import type {
  FormulaCatalog,
  FormulaCatalogCategory,
  FormulaCatalogEntry,
} from './formulaRef'
import { isFormulaSheet, listingJoinId } from './formulaRef'

export type CatalogListing = {
  catalogSheet: string
  name: string
  dim: string
  tag: Tag
}

/** Preference for catalog dim key order; first present key is the default dim. */
const CATALOG_DIM_ORDER = [
  'dmg',
  'heal',
  'shield',
  'param',
  'final',
  'common',
] as const

const catalogDimOrderSet = new Set<string>(CATALOG_DIM_ORDER)

/** Stable dim key order: known preference, then leftover names. */
export function orderCatalogDimKeys(dims: Iterable<string>): string[] {
  const keys = [...new Set(dims)]
  const known = CATALOG_DIM_ORDER.filter((dim) => keys.includes(dim))
  const unknown = keys
    .filter((dim) => !catalogDimOrderSet.has(dim))
    .sort((a, b) => a.localeCompare(b))
  return [...known, ...unknown]
}

function orderCatalogDims(dims: Record<string, Tag>): Record<string, Tag> {
  const ordered: Record<string, Tag> = {}
  for (const dim of orderCatalogDimKeys(Object.keys(dims))) {
    ordered[dim] = dims[dim]!
  }
  return ordered
}

function categoryFromMove(
  move: string | null | undefined
): FormulaCatalogCategory | undefined {
  if (move === 'normal' || move === 'charged' || move === 'plunging')
    return 'auto'
  if (move === 'skill' || move === 'burst') return move
  return undefined
}

/** Fallback when listings have no `move` (params, shields, heals, cons hits). */
export function categoryFromName(
  name: string
): FormulaCatalogCategory | undefined {
  if (
    name.startsWith('normal_') ||
    name.startsWith('charged_') ||
    name.startsWith('plunging_')
  )
    return 'auto'
  if (name === 'skill' || name.startsWith('skill_')) return 'skill'
  if (name === 'burst' || name.startsWith('burst_')) return 'burst'
  const cons = /^c([1-6])(?:_|$)/.exec(name)
  if (cons) return `constellation${cons[1]}` as FormulaCatalogCategory
  if (name.startsWith('a1_') || name.startsWith('p1_')) return 'passive1'
  if (name.startsWith('a4_') || name.startsWith('p2_')) return 'passive2'
  if (name.startsWith('p3_')) return 'passive3'
  return undefined
}

/** Group extracted listings into the FormulaRef catalog. Throws on invariant violations. */
export function buildFormulaCatalog(
  listings: CatalogListing[]
): FormulaCatalog {
  const catalog: FormulaCatalog = {}

  for (const listing of listings) {
    const { catalogSheet, name, dim, tag } = listing
    if (!name || !dim)
      throw new Error(
        `[gi-formula] catalog listing missing name/dim: ${JSON.stringify(listing)}`
      )
    if (!isFormulaSheet(catalogSheet)) continue

    catalog[catalogSheet] ??= {}
    const existing = catalog[catalogSheet][name]

    if (!existing) {
      catalog[catalogSheet][name] = {
        sheet: catalogSheet,
        name,
        dims: { [dim]: tag },
        exposeInProd: true,
      }
      continue
    }

    const prev = existing.dims[dim]
    if (prev && listingJoinId(prev) !== listingJoinId(tag)) {
      throw new Error(
        `[gi-formula] duplicate (${catalogSheet}, ${name}, ${dim}) with different tags`
      )
    }
    existing.dims[dim] = prev ?? tag
  }

  for (const sheetEntries of Object.values(catalog)) {
    for (const entry of Object.values(sheetEntries)) {
      finalizeCatalogEntry(entry)
    }
  }

  return catalog
}

export function isParamOnlyEntry(entry: FormulaCatalogEntry): boolean {
  const dims = Object.keys(entry.dims)
  return dims.length > 0 && dims.every((dim) => dim === 'param')
}

function finalizeCatalogEntry(entry: FormulaCatalogEntry) {
  entry.dims = orderCatalogDims(entry.dims)
  const dimKeys = Object.keys(entry.dims)
  const sample = entry.dims[dimKeys[0]!]
  const category =
    categoryFromMove(sample?.['move']) ?? categoryFromName(entry.name)
  if (category) entry.category = category
  if (isParamOnlyEntry(entry)) entry.exposeInProd = false
}
