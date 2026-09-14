import { describe, expect, it } from 'vitest'
import { formulaCatalog } from './formulaCatalog'
import { orderCatalogDimKeys } from './formulaCatalogBuild'
import {
  listingJoinId,
  STAT_SHEET,
  sameFormula,
  toTag,
  validateFormulaRef,
} from './formulaRef'

describe('FormulaRef catalog invariants', () => {
  it('keeps dim keys in default-first order', () => {
    for (const sheetEntries of Object.values(formulaCatalog)) {
      for (const entry of Object.values(sheetEntries)) {
        expect(Object.keys(entry.dims), `${entry.sheet}/${entry.name}`).toEqual(
          orderCatalogDimKeys(Object.keys(entry.dims))
        )
      }
    }
  })

  it('toTag dim lookup matches catalog dim tags', () => {
    for (const sheetEntries of Object.values(formulaCatalog)) {
      for (const entry of Object.values(sheetEntries)) {
        for (const dim of Object.keys(entry.dims)) {
          const tag = toTag({ sheet: entry.sheet, name: entry.name, dim })
          expect(tag, `${entry.sheet}/${entry.name}:${dim}`).toBeDefined()
          expect(listingJoinId(tag!)).toBe(listingJoinId(entry.dims[dim]!))
        }
      }
    }
  })

  it('round-trips Noelle skill_heal via FormulaRef', () => {
    const tag = toTag({
      sheet: 'Noelle',
      name: 'skill_heal',
      dim: 'heal',
    })
    expect(tag?.q).toBe('heal')
    expect(tag?.name).toBe('skill_heal')
  })

  it('returns undefined for missing dim or unknown name', () => {
    expect(
      validateFormulaRef({
        sheet: 'Noelle',
        name: 'skill_heal',
        dim: 'dmg',
      })
    ).toBeUndefined()
    expect(
      validateFormulaRef({
        sheet: 'Noelle',
        name: 'NotARealFormula',
        dim: 'heal',
      })
    ).toBeUndefined()
    expect(
      toTag({ sheet: STAT_SHEET, name: 'atk', dim: 'initial' })
    ).toBeUndefined()
    expect(
      validateFormulaRef({
        sheet: 'agg',
        name: 'atk',
        dim: 'final',
      })
    ).toBeUndefined()
    expect(validateFormulaRef(undefined)).toBeUndefined()
    expect(validateFormulaRef('Noelle')).toBeUndefined()
  })

  it('sameFormula ignores dim', () => {
    expect(
      sameFormula(
        { sheet: 'Noelle', name: 'burst' },
        { sheet: 'Noelle', name: 'burst' }
      )
    ).toBe(true)
    expect(
      sameFormula(
        { sheet: 'Noelle', name: 'burst', dim: 'dmg' },
        { sheet: 'Noelle', name: 'burst', dim: 'heal' }
      )
    ).toBe(true)
    expect(
      sameFormula(
        { sheet: 'Noelle', name: 'burst' },
        { sheet: 'Noelle', name: 'skill' }
      )
    ).toBe(false)
  })
})
