import type { Read } from '@genshin-optimizer/game-opt/engine'
import type { Field } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import type { Calculator, Tag } from '@genshin-optimizer/zzz/formula'
import { own } from '@genshin-optimizer/zzz/formula'
import { useMemo } from 'react'
import { groupFormulas } from '../bundledFormulaFields'
import {
  groupFieldsByCategory,
  orderedFieldCategories,
  type TalentSheetElementKey,
} from '../char/fieldCategory'
import {
  buildListingReadMap,
  filterNonStatFields,
  listStatReadsFromFormulas,
} from '../optTarget'

export function useGroupedOptFormulaFields(
  charKey: CharacterKey | undefined,
  calc: Calculator | null | undefined
) {
  return useMemo(() => {
    if (!calc || !charKey) {
      return {
        statReads: [] as Read<Tag>[],
        readByListingKey: new Map<string, Read<Tag>>(),
        categorySections: [] as Array<{
          category: TalentSheetElementKey
          fields: Field[]
        }>,
        otherFields: [] as Field[],
      }
    }
    const reads = calc.listFormulas(own.listing.formulas)
    const readByListingKey = buildListingReadMap(reads)
    const fields = groupFormulas(reads, charKey, charKey)
    const { byCategory, other } = groupFieldsByCategory(charKey, fields)
    return {
      statReads: listStatReadsFromFormulas(reads),
      readByListingKey,
      categorySections: orderedFieldCategories(byCategory),
      otherFields: filterNonStatFields(other),
    }
  }, [calc, charKey])
}
