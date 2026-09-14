import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import type { Calculator } from '@genshin-optimizer/zzz/formula'
import { own } from '@genshin-optimizer/zzz/formula'
import { useMemo } from 'react'
import {
  type CatalogJoinedRow,
  groupJoinedRows,
  joinCatalogRows,
} from '../catalogListing'
import {
  type AbilityFieldsBySkill,
  abilityFieldsBySkillFromRows,
} from '../catalogRowField'
import type { TalentSheetElementKey } from '../char/consts'

const emptyGrouped = {
  rows: [] as CatalogJoinedRow[],
  abilityFieldsBySkill: {} as AbilityFieldsBySkill,
  statRows: [] as CatalogJoinedRow[],
  otherRows: [] as CatalogJoinedRow[],
  categorySections: [] as Array<{
    category: TalentSheetElementKey
    rows: CatalogJoinedRow[]
  }>,
}

/** Live catalog join for opt-panel lists and mechanics skill injection. */
export function useCharCatalogRows(
  charKey: CharacterKey | undefined,
  calc: Calculator | null | undefined
) {
  return useMemo(() => {
    if (!charKey) return emptyGrouped

    const reads = calc?.listFormulas(own.listing.formulas) ?? []
    const rows = joinCatalogRows(charKey, reads)
    const abilityFieldsBySkill = abilityFieldsBySkillFromRows(rows)
    const grouped = groupJoinedRows(rows)

    return {
      rows,
      abilityFieldsBySkill,
      ...grouped,
    }
  }, [calc, charKey])
}
