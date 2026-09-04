import { isSkillKey, type SkillKey } from '@genshin-optimizer/zzz/consts'
import type { Tag } from './data/util'
import { abilityBaseName, parseAbilityHitFromName } from './formulaMeta'
import {
  type FormulaCatalog,
  type FormulaCatalogEntry,
  type FormulaSheet,
  isFormulaSheet,
  isGenericDmgInstName,
  listingJoinId,
  STAT_SHEET,
} from './formulaRef'
import { isProductionFormulaListing } from './productionFormulaListing'

export type CatalogListing = {
  catalogSheet: string
  name: string
  dim: string
  tag: Tag
}

function stripAttribute(tag: Tag): Tag {
  const { attribute: _, ...rest } = tag
  return rest
}

/** Preference for catalog dim key order; first present key is the default dim. */
const CATALOG_DIM_ORDER = [
  'standardDmg',
  'sheerDmg',
  'dazeBuildup',
  'anomBuildup',
  'anomalyDmg',
  'final',
  'initial',
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

function overlaysFor(sheet: FormulaSheet, name: string, tag: Tag) {
  if (tag.skillType) return undefined
  if (isGenericDmgInstName(name))
    return { damageType1: true, damageType2: true }
  if (sheet === STAT_SHEET && name === 'dmg_') return { attribute: true }
  return undefined
}

/** Group extracted listings into the FormulaRef catalog. Throws on invariant violations. */
export function buildFormulaCatalog(
  listings: CatalogListing[]
): FormulaCatalog {
  const catalog: FormulaCatalog = {}

  for (const listing of listings) {
    const { catalogSheet, name, dim, tag } = listing
    if (!isFormulaSheet(catalogSheet) || !name || !dim)
      throw new Error(
        `[zzz-formula] catalog listing missing sheet/name/dim: ${JSON.stringify(listing)}`
      )

    catalog[catalogSheet] ??= {}
    const existing = catalog[catalogSheet][name]
    const dimTag =
      catalogSheet === STAT_SHEET && name === 'dmg_' ? stripAttribute(tag) : tag

    if (!existing) {
      catalog[catalogSheet][name] = {
        sheet: catalogSheet,
        name,
        dims: { [dim]: dimTag },
        exposeInProd: exposeInProdForListing(tag, name),
      }
      continue
    }

    const prev = existing.dims[dim]
    if (prev && listingJoinId(prev) !== listingJoinId(dimTag)) {
      throw new Error(
        `[zzz-formula] duplicate (${catalogSheet}, ${name}, ${dim}) with different tags`
      )
    }
    existing.dims[dim] = prev ?? dimTag
    existing.exposeInProd =
      existing.exposeInProd || exposeInProdForListing(tag, name)
  }

  for (const sheetEntries of Object.values(catalog)) {
    for (const entry of Object.values(sheetEntries)) {
      finalizeCatalogEntry(entry)
    }
  }

  return catalog
}

function finalizeCatalogEntry(entry: FormulaCatalogEntry) {
  entry.dims = orderCatalogDims(entry.dims)
  const dimKeys = Object.keys(entry.dims)
  const unknown = dimKeys.filter((dim) => !catalogDimOrderSet.has(dim))
  if (unknown.length && dimKeys.length > 1) {
    console.error(
      `[zzz-formula] ${entry.sheet}/${entry.name} has dims outside catalog order`,
      unknown
    )
  }
  const hasStandard = dimKeys.includes('standardDmg')
  const hasSheer = dimKeys.includes('sheerDmg')
  if (hasStandard && hasSheer) {
    throw new Error(
      `[zzz-formula] ${entry.sheet}/${entry.name} has both standardDmg and sheerDmg`
    )
  }

  const sample = entry.dims[dimKeys[0]!]
  const stamps = stampsFromListingTag(sample)
  if (stamps.skill) {
    entry.skill = stamps.skill
    entry.abilityKey = stamps.abilityKey
    if (stamps.hitIndex) entry.hitIndex = stamps.hitIndex
  }

  const overlays = overlaysFor(entry.sheet, entry.name, sample)
  if (overlays && sample.skillType) {
    throw new Error(
      `[zzz-formula] overlays on ability skillType entry ${entry.sheet}/${entry.name}`
    )
  }
  if (overlays?.damageType1 && !isGenericDmgInstName(entry.name)) {
    throw new Error(
      `[zzz-formula] overlays.damageType1 on non-generic-inst ${entry.sheet}/${entry.name}`
    )
  }
  if (overlays) entry.overlays = overlays
}

function skillFromSkillType(
  skillType: string | null | undefined
): SkillKey | undefined {
  if (!skillType?.endsWith('Skill')) return undefined
  const skill = skillType.slice(0, -'Skill'.length)
  return isSkillKey(skill) ? skill : undefined
}

function stampsFromListingTag(tag: Tag): {
  skill?: SkillKey
  abilityKey?: string
  hitIndex?: string
} {
  const skill = skillFromSkillType(tag.skillType)
  if (!skill || !tag.name) return {}
  const { abilityKey, hitIndex } = parseAbilityHitFromName(
    abilityBaseName(tag.name)
  )
  return { skill, abilityKey, ...(hitIndex ? { hitIndex } : {}) }
}

function exposeInProdForListing(tag: Tag, name: string): boolean {
  return isProductionFormulaListing({ qt: tag.qt, name })
}
