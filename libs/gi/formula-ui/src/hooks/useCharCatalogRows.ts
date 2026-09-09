import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { Calculator } from '@genshin-optimizer/gi/formula'
import { own } from '@genshin-optimizer/gi/formula'
import { useMemo } from 'react'
import {
  type CatalogJoinedRow,
  groupJoinedRows,
  joinCatalogRows,
} from '../catalogListing'
import type { TalentSheetElementKey } from '../char/consts'

const emptyGrouped = {
  rows: [] as CatalogJoinedRow[],
  statRows: [] as CatalogJoinedRow[],
  otherRows: [] as CatalogJoinedRow[],
  categorySections: [] as Array<{
    category: TalentSheetElementKey
    rows: CatalogJoinedRow[]
  }>,
}

/** Live catalog join for opt-panel lists. */
export function useCharCatalogRows(
  charKey: CharacterKey | undefined,
  calc: Calculator | null | undefined
) {
  return useMemo(() => {
    if (!charKey) return emptyGrouped

    const reads = calc?.listFormulas(own.listing.formulas) ?? []
    const rows = joinCatalogRows(charKey, reads)
    return {
      rows,
      ...groupJoinedRows(rows),
    }
  }, [calc, charKey])
}
