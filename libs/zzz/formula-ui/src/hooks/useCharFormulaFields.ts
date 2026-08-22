import type { Read } from '@genshin-optimizer/game-opt/engine'
import type { Field } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import type { Calculator, Tag } from '@genshin-optimizer/zzz/formula'
import { own } from '@genshin-optimizer/zzz/formula'
import { useMemo } from 'react'
import { buildCharFormulaFields } from '../char/charFormulaFields'
import {
  groupFieldsByCategory,
  orderedFieldCategories,
  type TalentSheetElementKey,
} from '../char/fieldCategory'
import { filterNonStatFields, listStatReadsFromFormulas } from '../optTarget'

const emptyGrouped = {
  reads: [] as Read<Tag>[],
  fields: [] as Field[],
  readByListingKey: new Map<string, Read<Tag>>(),
  abilityFieldsBySkill: {},
  statReads: [] as Read<Tag>[],
  categorySections: [] as Array<{
    category: TalentSheetElementKey
    fields: Field[]
  }>,
  otherFields: [] as Field[],
}

/** Live formula reads, bundled fields, and opt-panel category grouping. */
export function useCharFormulaFields(
  charKey: CharacterKey | undefined,
  calc: Calculator | null | undefined
) {
  return useMemo(() => {
    if (!charKey) return emptyGrouped

    const reads = calc?.listFormulas(own.listing.formulas) ?? []
    const built = buildCharFormulaFields(charKey, reads)

    if (!calc) {
      return {
        ...built,
        statReads: [] as Read<Tag>[],
        categorySections: [] as Array<{
          category: TalentSheetElementKey
          fields: Field[]
        }>,
        otherFields: [] as Field[],
      }
    }

    const { byCategory, other } = groupFieldsByCategory(charKey, built.fields)
    return {
      ...built,
      statReads: listStatReadsFromFormulas(reads),
      categorySections: orderedFieldCategories(byCategory),
      otherFields: filterNonStatFields(other),
    }
  }, [calc, charKey])
}
