import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import type { Read } from '@genshin-optimizer/game-opt/engine'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import type {
  FormulaCatalogEntry,
  FormulaRef,
  Tag,
} from '@genshin-optimizer/zzz/formula'
import {
  formulaCatalog,
  listingJoinId,
  lookupFormulaRef,
  STAT_SHEET,
  sameFormula,
} from '@genshin-optimizer/zzz/formula'
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
    const joined = joinEntryReads(entry, joinMap)
    if (!joined.size) continue
    rows.push({ entry, reads: joined })
  }
  return rows
}

function readWithTag(read: Read<Tag>, tag: Tag): Read<Tag> {
  if (typeof read.withTag !== 'function') {
    throw new Error(
      '[zzz-formula-ui] listing Read is missing withTag; expected a Pando Read'
    )
  }
  return read.withTag(tag)
}

/** Live listing Read for a validated ref, with overlays applied. */
export function listingReadForRef(
  ref: FormulaRef | undefined,
  rows: CatalogJoinedRow[]
): Read<Tag> | undefined {
  const looked = lookupFormulaRef(ref)
  if (!looked) return undefined
  const row = rows.find((r) => sameFormula(r.entry, looked.ref))
  const base = row?.reads.get(looked.ref.dim)
  if (!base) return undefined
  return readWithTag(base, looked.tag)
}

export function refFromJoinedRow({
  entry,
  reads,
}: CatalogJoinedRow): FormulaRef | undefined {
  const dim = reads.keys().next().value
  if (!dim) return undefined
  const nextBase: FormulaRef = {
    sheet: entry.sheet,
    name: entry.name,
    dim,
  }
  const liveAttribute = reads.get(dim)?.tag.attribute
  const next: FormulaRef =
    entry.overlays?.attribute && liveAttribute
      ? { ...nextBase, attribute: liveAttribute }
      : nextBase
  return lookupFormulaRef(next)?.ref
}

function dimTagForDisplay(
  entry: FormulaCatalogEntry,
  dim: string,
  currentRef: FormulaRef | undefined,
  liveTag: Tag
): Tag {
  const looked = lookupFormulaRef(currentRef)
  if (looked && sameFormula(looked.ref, entry) && looked.ref.dim === dim) {
    return looked.tag
  }
  return liveTag
}

export function dimReadForDisplay(
  { entry, reads }: CatalogJoinedRow,
  dim: string,
  currentRef?: FormulaRef
): { tag: Tag; read: Read<Tag> } | undefined {
  const read = reads.get(dim)
  if (!read) return undefined
  const tag = dimTagForDisplay(entry, dim, currentRef, read.tag)
  return {
    tag,
    read: tag === read.tag ? read : readWithTag(read, tag),
  }
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
    const skill = row.entry.skill
    if (skill) {
      const list = byCategory.get(skill) ?? []
      list.push(row)
      byCategory.set(skill, list)
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
