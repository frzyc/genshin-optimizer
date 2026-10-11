import { describe, expect, it } from 'vitest'
import { orderCatalogDimKeys } from './formulaCatalogBuild'
import {
  listingJoinId,
  STAT_SHEET,
  sameFormula,
  toTag,
  validateFormulaRef,
} from './formulaRef'
import { formulaCatalog } from './meta/formulaCatalog'

const numberedHitName = /_?(?:aftershock)?\d+$/

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

  it('toTag dim lookup matches catalog dim tags with no overlays', () => {
    for (const sheetEntries of Object.values(formulaCatalog)) {
      for (const entry of Object.values(sheetEntries)) {
        for (const dim of Object.keys(entry.dims)) {
          const tag = toTag({ sheet: entry.sheet, name: entry.name, dim })
          expect(tag).toBeDefined()
          expect(listingJoinId(tag!)).toBe(listingJoinId(entry.dims[dim]!))
        }
      }
    }
  })

  it('stamps skill on every numbered ability hit', () => {
    for (const [sheet, sheetEntries] of Object.entries(formulaCatalog)) {
      if (sheet === STAT_SHEET) continue
      for (const entry of Object.values(sheetEntries)) {
        if (!numberedHitName.test(entry.name)) continue
        const label = `${sheet}/${entry.name}`
        expect(entry.skill, label).toBeDefined()
        expect(entry.abilityKey, label).toBeDefined()
        for (const [dim, tag] of Object.entries(entry.dims)) {
          expect(tag.skillType, `${label}:${dim}`).toMatch(/Skill$/)
        }
      }
    }
  })

  it('round-trips Yixuan sheer ability via FormulaRef', () => {
    const tag = toTag({
      sheet: 'Yixuan',
      name: 'BasicAttackCirrusStrike_0',
      dim: 'sheerDmg',
    })
    expect(tag?.q).toBe('sheerDmg')
    expect(tag?.name).toBe('BasicAttackCirrusStrike_0')
    expect(formulaCatalog.Yixuan.BasicAttackCirrusStrike_0.skill).toBe('basic')
  })

  it('allows overlays on generic inst and not on ability-stamped entries', () => {
    const inst = formulaCatalog.Anby.standardDmgInst
    expect(inst.overlays?.damageType1).toBe(true)
    expect(inst.overlays?.damageType2).toBe(true)
    expect(
      validateFormulaRef({
        sheet: 'Anby',
        name: 'standardDmgInst',
        dim: 'standardDmg',
        damageType1: 'basic',
        damageType2: 'aftershock',
      })
    ).toMatchObject({
      damageType1: 'basic',
      damageType2: 'aftershock',
    })

    const ability = formulaCatalog.Anby.BasicAttackTurboVolt_0
    expect(ability.skill).toBe('basic')
    expect(ability.overlays).toBeUndefined()
    expect(
      validateFormulaRef({
        sheet: 'Anby',
        name: 'BasicAttackTurboVolt_0',
        dim: 'standardDmg',
        damageType1: 'basic',
        damageType2: 'aftershock',
      })
    ).toEqual({
      sheet: 'Anby',
      name: 'BasicAttackTurboVolt_0',
      dim: 'standardDmg',
    })
  })

  it('returns undefined for missing dim or unknown name', () => {
    expect(
      validateFormulaRef({
        sheet: 'Anby',
        name: 'BasicAttackTurboVolt_0',
        dim: 'sheerDmg',
      })
    ).toBeUndefined()
    expect(
      validateFormulaRef({
        sheet: 'Anby',
        name: 'NotARealFormula_0',
        dim: 'standardDmg',
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
    expect(validateFormulaRef('Anby')).toBeUndefined()
  })

  it('sameFormula ignores dim', () => {
    expect(
      sameFormula(
        { sheet: 'Anby', name: 'BasicAttackTurboVolt_0' },
        { sheet: 'Anby', name: 'BasicAttackTurboVolt_0' }
      )
    ).toBe(true)
    expect(
      sameFormula(
        { sheet: 'Anby', name: 'BasicAttackTurboVolt_0', dim: 'standardDmg' },
        { sheet: 'Anby', name: 'BasicAttackTurboVolt_0', dim: 'dazeBuildup' }
      )
    ).toBe(true)
    expect(
      sameFormula(
        { sheet: 'Anby', name: 'BasicAttackTurboVolt_0' },
        { sheet: 'Anby', name: 'BasicAttackTurboVolt_1' }
      )
    ).toBe(false)
  })
})
