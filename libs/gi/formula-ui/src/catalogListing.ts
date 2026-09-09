import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import type { Read } from '@genshin-optimizer/game-opt/engine'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type {
  FormulaCatalogEntry,
  FormulaRef,
  Tag,
} from '@genshin-optimizer/gi/formula'
import {
  categoryFromName,
  formulaCatalog,
  isParamOnlyEntry,
  listingJoinId,
  lookupFormulaRef,
  sameFormula,
  STAT_SHEET,
} from '@genshin-optimizer/gi/formula'
import {
  allTalentSheetElementKey,
  type TalentSheetElementKey,
} from './char/consts'

export type CatalogJoinedRow = {
  entry: FormulaCatalogEntry
  reads: Map<string, Read<Tag>>
}

function buildListingJoinMap(reads: Read<Tag>[]): Map<string, Read<Tag>> {
  const map = new Map<string, Read<Tag>>()
  for (const read of reads) {
    map.set(listingJoinId(read.tag), read)
  }
  return map
}

function joinEntryReads(
  entry: FormulaCatalogEntry,
  joinMap: Map<string, Read<Tag>>
): Map<string, Read<Tag>> {
  const reads = new Map<string, Read<Tag>>()
  for (const [dim, tag] of Object.entries(entry.dims)) {
    const read = joinMap.get(listingJoinId(tag))
    if (read) reads.set(dim, read)
  }
  return reads
}

function catalogEntriesForChar(charKey: CharacterKey): FormulaCatalogEntry[] {
  return [
    ...Object.values(formulaCatalog[STAT_SHEET] ?? {}),
    ...Object.values(formulaCatalog[charKey] ?? {}),
  ]
}

export function joinCatalogRows(
  charKey: CharacterKey,
  reads: Read<Tag>[]
): CatalogJoinedRow[] {
  const joinMap = buildListingJoinMap(reads)
  const rows: CatalogJoinedRow[] = []
  for (const entry of catalogEntriesForChar(charKey)) {
    if (!shouldShowDevComponents && !entry.exposeInProd) continue
    // Kit constants (CD, duration, stamina, energy) are sheet fields, not opt targets.
    if (isParamOnlyEntry(entry)) continue
    const joined = joinEntryReads(entry, joinMap)
    if (!joined.size) continue
    rows.push({ entry, reads: joined })
  }
  return rows
}

export function groupJoinedRows(rows: CatalogJoinedRow[]): {
  statRows: CatalogJoinedRow[]
  otherRows: CatalogJoinedRow[]
  categorySections: Array<{
    category: TalentSheetElementKey
    rows: CatalogJoinedRow[]
  }>
} {
  const statRows: CatalogJoinedRow[] = []
  const otherRows: CatalogJoinedRow[] = []
  const byCategory = new Map<TalentSheetElementKey, CatalogJoinedRow[]>()

  for (const row of rows) {
    if (row.entry.sheet === STAT_SHEET) {
      statRows.push(row)
      continue
    }
    const category = talentCategoryForEntry(row.entry)
    if (category) {
      const list = byCategory.get(category) ?? []
      list.push(row)
      byCategory.set(category, list)
    } else {
      otherRows.push(row)
    }
  }

  const categorySections = allTalentSheetElementKey
    .filter((category) => byCategory.has(category))
    .map((category) => ({
      category,
      rows: byCategory.get(category)!,
    }))

  return { statRows, otherRows, categorySections }
}

function talentCategoryForEntry(
  entry: FormulaCatalogEntry
): TalentSheetElementKey | undefined {
  const category = entry.category ?? categoryFromName(entry.name)
  if (
    category &&
    (allTalentSheetElementKey as readonly string[]).includes(category)
  )
    return category as TalentSheetElementKey
  return undefined
}

export function dimReadForDisplay(
  { reads }: CatalogJoinedRow,
  dim: string
): { tag: Tag; read: Read<Tag> } | undefined {
  const read = reads.get(dim)
  if (!read) return undefined
  return { tag: read.tag, read }
}

export function refFromJoinedRow({
  entry,
  reads,
}: CatalogJoinedRow): FormulaRef | undefined {
  const dim = reads.keys().next().value
  if (!dim) return undefined
  return lookupFormulaRef({
    sheet: entry.sheet,
    name: entry.name,
    dim,
  })?.ref
}

/** Live listing Read for a validated ref. */
export function listingReadForRef(
  ref: FormulaRef | undefined,
  rows: CatalogJoinedRow[]
): Read<Tag> | undefined {
  const looked = lookupFormulaRef(ref)
  if (!looked) return undefined
  const row = rows.find((r) => sameFormula(r.entry, looked.ref))
  return row?.reads.get(looked.ref.dim)
}
