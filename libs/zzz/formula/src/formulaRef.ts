import {
  type AttributeKey,
  allAttributeKeys,
  allCharacterKeys,
  allWengineKeys,
  type CharacterKey,
  type SkillKey,
  type WengineKey,
} from '@genshin-optimizer/zzz/consts'
import type { DamageType, Tag } from './data/util'
import { stripCalcContextTag } from './hit'
import { formulaCatalog } from './meta/formulaCatalog'

/** Catalog/DB namespace for listing stats. Not a Pando sheet. */
export const STAT_SHEET = 'stat'

export type FormulaSheet = CharacterKey | WengineKey | typeof STAT_SHEET

const formulaSheetSet = new Set<string>([
  STAT_SHEET,
  ...allCharacterKeys,
  ...allWengineKeys,
])

export function isFormulaSheet(
  sheet: string | null | undefined
): sheet is FormulaSheet {
  return !!sheet && formulaSheetSet.has(sheet)
}

export const genericDmgInstNames = ['standardDmgInst', 'sheerDmgInst'] as const
export type GenericDmgInstName = (typeof genericDmgInstNames)[number]

export function isGenericDmgInstName(
  name: string | null | undefined
): name is GenericDmgInstName {
  return !!name && (genericDmgInstNames as readonly string[]).includes(name)
}

export type SpecificDmgTypeKey = Exclude<
  DamageType,
  'anomaly' | 'disorder' | 'aftershock' | 'elemental' | 'vortex'
>

export const specificDmgTypeKeys: SpecificDmgTypeKey[] = [
  'basic',
  'dash',
  'dodgeCounter',
  'special',
  'exSpecial',
  'chain',
  'ult',
  'quickAssist',
  'defensiveAssist',
  'evasiveAssist',
  'assistFollowUp',
]

function isSpecificDmgTypeKey(key: string): key is SpecificDmgTypeKey {
  return specificDmgTypeKeys.includes(key as SpecificDmgTypeKey)
}

export type FormulaRef = {
  sheet: FormulaSheet
  name: string
  dim: string
  damageType1?: SpecificDmgTypeKey
  damageType2?: 'aftershock' | 'abloom'
  attribute?: AttributeKey
}

type OverlayInput = {
  damageType1?: string
  damageType2?: string
  attribute?: string
}

export type CatalogOverlays = {
  damageType1?: boolean
  damageType2?: boolean
  attribute?: boolean
}

export type FormulaCatalogEntry = {
  sheet: FormulaSheet
  name: string
  dims: Record<string, Tag>
  overlays?: CatalogOverlays
  skill?: SkillKey
  abilityKey?: string
  hitIndex?: string
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

/** Join key for catalog dim tags vs live listFormulas Reads. Ignores overlay cats. */
export function listingJoinId(tag: {
  sheet?: string | null
  name?: string | null
  q?: string | null
  qt?: string | null
}): string {
  return `${tag.sheet ?? ''}:${tag.name ?? ''}:${tag.q ?? ''}:${tag.qt ?? ''}`
}

/** Catalog identity: same `(sheet, name)`. Ignores dim and overlays. */
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

function overlayFields(
  ref: OverlayInput,
  entry: FormulaCatalogEntry
): Pick<FormulaRef, 'damageType1' | 'damageType2' | 'attribute'> {
  const damageType1 =
    entry.overlays?.damageType1 &&
    ref.damageType1 &&
    isSpecificDmgTypeKey(ref.damageType1)
      ? ref.damageType1
      : undefined
  const damageType2 =
    entry.overlays?.damageType2 &&
    (ref.damageType2 === 'aftershock' || ref.damageType2 === 'abloom')
      ? ref.damageType2
      : undefined
  const attribute =
    entry.overlays?.attribute &&
    ref.attribute &&
    (allAttributeKeys as readonly string[]).includes(ref.attribute)
      ? (ref.attribute as AttributeKey)
      : undefined

  return {
    ...(damageType1 ? { damageType1 } : {}),
    ...(damageType2 ? { damageType2 } : {}),
    ...(attribute ? { attribute } : {}),
  }
}

function tagFromResolved(ref: FormulaRef, entry: FormulaCatalogEntry): Tag {
  const base = entry.dims[ref.dim]!
  return stripCalcContextTag({
    ...base,
    ...(ref.damageType1 ? { damageType1: ref.damageType1 } : {}),
    ...(ref.damageType2 ? { damageType2: ref.damageType2 } : {}),
    ...(ref.attribute ? { attribute: ref.attribute } : {}),
  })
}

function resolveFormulaRef(
  sheet: FormulaSheet,
  name: string,
  dim: string,
  overlays: OverlayInput,
  catalog: FormulaCatalog
): ResolvedFormulaRef | undefined {
  if (!name || !dim) return undefined
  const entry = catalogEntryForDim({ sheet, name }, dim, catalog)
  if (!entry) return undefined
  const ref: FormulaRef = {
    sheet,
    name,
    dim,
    ...overlayFields(overlays, entry),
  }
  return { ref, entry, tag: tagFromResolved(ref, entry) }
}

type PersistFormulaRef = {
  sheet: FormulaSheet
  name: string
  dim: string
} & OverlayInput

function persistString(
  o: Record<string, unknown>,
  key: string
): string | undefined {
  const value = o[key]
  return typeof value === 'string' ? value : undefined
}

function persistFormulaRef(raw: unknown): PersistFormulaRef | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const o = raw as Record<string, unknown>
  const sheet = persistString(o, 'sheet')
  const name = persistString(o, 'name')
  const dim = persistString(o, 'dim')
  if (!sheet || !name || !dim || !isFormulaSheet(sheet)) return undefined
  const damageType1 = persistString(o, 'damageType1')
  const damageType2 = persistString(o, 'damageType2')
  const attribute = persistString(o, 'attribute')
  return {
    sheet,
    name,
    dim,
    ...(damageType1 ? { damageType1 } : {}),
    ...(damageType2 ? { damageType2 } : {}),
    ...(attribute ? { attribute } : {}),
  }
}

/** Catalog lookup for a trusted `FormulaRef`. */
export function lookupFormulaRef(
  ref: FormulaRef | undefined,
  catalog: FormulaCatalog = formulaCatalog
): ResolvedFormulaRef | undefined {
  if (!ref) return undefined
  return resolveFormulaRef(ref.sheet, ref.name, ref.dim, ref, catalog)
}

/** Persist sanitizer. LocalStorage / Zod JSON is `unknown` until this returns. */
export function validateFormulaRef(
  raw: unknown,
  catalog: FormulaCatalog = formulaCatalog
): FormulaRef | undefined {
  const parsed = persistFormulaRef(raw)
  if (!parsed) return undefined
  return resolveFormulaRef(
    parsed.sheet,
    parsed.name,
    parsed.dim,
    parsed,
    catalog
  )?.ref
}

export function toTag(
  ref: FormulaRef | undefined,
  catalog: FormulaCatalog = formulaCatalog
): Tag | undefined {
  return lookupFormulaRef(ref, catalog)?.tag
}

export function withDamageType1(
  ref: FormulaRef,
  damageType1: SpecificDmgTypeKey | undefined,
  catalog: FormulaCatalog = formulaCatalog
): FormulaRef | undefined {
  const entry = catalogEntryForDim(ref, ref.dim, catalog)
  if (!entry) return undefined
  const { damageType1: _, ...rest } = ref
  if (!entry.overlays?.damageType1) return rest
  return damageType1 ? { ...rest, damageType1 } : rest
}

export function withDamageType2(
  ref: FormulaRef,
  aftershock: boolean,
  catalog: FormulaCatalog = formulaCatalog
): FormulaRef | undefined {
  const entry = catalogEntryForDim(ref, ref.dim, catalog)
  if (!entry) return undefined
  const { damageType2: _, ...rest } = ref
  if (!entry.overlays?.damageType2) return rest
  return aftershock ? { ...rest, damageType2: 'aftershock' } : rest
}

export function withAttribute(
  ref: FormulaRef,
  attribute: AttributeKey | undefined,
  catalog: FormulaCatalog = formulaCatalog
): FormulaRef | undefined {
  const entry = catalogEntryForDim(ref, ref.dim, catalog)
  if (!entry) return undefined
  const { attribute: _, ...rest } = ref
  if (!entry.overlays?.attribute) return rest
  return attribute ? { ...rest, attribute } : rest
}

export function withDim(
  ref: FormulaRef,
  dim: string,
  catalog: FormulaCatalog = formulaCatalog
): FormulaRef | undefined {
  if (!catalogEntryForDim(ref, dim, catalog)) return undefined
  return { ...ref, dim }
}
