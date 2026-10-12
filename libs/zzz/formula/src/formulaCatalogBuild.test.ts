import { describe, expect, it } from 'vitest'
import type { Tag } from './data/util'
import { buildFormulaCatalog } from './formulaCatalogBuild'
import { STAT_SHEET } from './formulaRef'

const atkFinal = {
  et: 'own',
  qt: 'final',
  q: 'atk',
  sheet: 'agg',
} as Tag

describe('buildFormulaCatalog', () => {
  it('groups named listings by sheet+name into dims', () => {
    const catalog = buildFormulaCatalog([
      {
        catalogSheet: 'Anby',
        name: 'Hit_0',
        dim: 'dazeBuildup',
        tag: {
          et: 'own',
          qt: 'formula',
          q: 'dazeBuildup',
          sheet: 'Anby',
          name: 'Hit_0',
          skillType: 'basicSkill',
        },
      },
      {
        catalogSheet: 'Anby',
        name: 'Hit_0',
        dim: 'standardDmg',
        tag: {
          et: 'own',
          qt: 'formula',
          q: 'standardDmg',
          sheet: 'Anby',
          name: 'Hit_0',
          skillType: 'basicSkill',
        },
      },
    ])
    const entry = catalog.Anby.Hit_0
    expect(Object.keys(entry.dims)).toEqual(['standardDmg', 'dazeBuildup'])
    expect(entry.skill).toBe('basic')
    expect(entry.abilityKey).toBe('Hit')
    expect(entry.hitIndex).toBe('0')
    expect(entry.overlays).toBeUndefined()
  })

  it('maps nameless stats to sheet:stat', () => {
    const catalog = buildFormulaCatalog([
      {
        catalogSheet: STAT_SHEET,
        name: 'atk',
        dim: 'initial',
        tag: { ...atkFinal, qt: 'initial' },
      },
      {
        catalogSheet: STAT_SHEET,
        name: 'atk',
        dim: 'final',
        tag: atkFinal,
      },
    ])
    expect(Object.keys(catalog.stat.atk.dims)).toEqual(['final', 'initial'])
    expect(catalog.stat.atk.dims.final.q).toBe('atk')
    expect(catalog.stat.atk.dims.initial.qt).toBe('initial')
    expect(catalog.stat.atk.exposeInProd).toBe(true)
  })

  it('sets inst overlays and strips dmg_ attribute', () => {
    const catalog = buildFormulaCatalog([
      {
        catalogSheet: 'Anby',
        name: 'standardDmgInst',
        dim: 'standardDmg',
        tag: {
          et: 'own',
          qt: 'formula',
          q: 'standardDmg',
          sheet: 'Anby',
          name: 'standardDmgInst',
        },
      },
      {
        catalogSheet: STAT_SHEET,
        name: 'dmg_',
        dim: 'final',
        tag: {
          et: 'own',
          qt: 'final',
          q: 'dmg_',
          sheet: 'agg',
          attribute: 'electric',
        },
      },
    ])
    expect(catalog.Anby.standardDmgInst.overlays).toEqual({
      damageType1: true,
      damageType2: true,
    })
    expect(catalog.stat.dmg_.overlays?.attribute).toBe(true)
    expect(catalog.stat.dmg_.dims.final.attribute).toBeUndefined()
  })

  it('throws when standardDmg and sheerDmg share a name', () => {
    expect(() =>
      buildFormulaCatalog([
        {
          catalogSheet: 'Yixuan',
          name: 'Hit_0',
          dim: 'standardDmg',
          tag: { q: 'standardDmg', name: 'Hit_0', sheet: 'Yixuan' },
        },
        {
          catalogSheet: 'Yixuan',
          name: 'Hit_0',
          dim: 'sheerDmg',
          tag: { q: 'sheerDmg', name: 'Hit_0', sheet: 'Yixuan' },
        },
      ])
    ).toThrow(/standardDmg and sheerDmg/)
  })

  it('throws on a catalog sheet that is not a FormulaSheet', () => {
    expect(() =>
      buildFormulaCatalog([
        {
          catalogSheet: 'agg',
          name: 'atk',
          dim: 'final',
          tag: atkFinal,
        },
      ])
    ).toThrow(/missing sheet/)
  })
})
