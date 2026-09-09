import { STAT_SHEET, formulaCatalog } from './index'
import { buildFormulaCatalog, categoryFromName } from './formulaCatalogBuild'

describe('formulaCatalog', () => {
  it('puts unnamed stats under STAT_SHEET with a final dim', () => {
    expect(formulaCatalog[STAT_SHEET]?.atk?.dims.final).toBeTruthy()
    expect(formulaCatalog[STAT_SHEET]?.hp?.sheet).toBe(STAT_SHEET)
  })

  it('joins Nahida combat names as one dim (dmg)', () => {
    const nahida = formulaCatalog.Nahida
    expect(nahida).toBeTruthy()
    const combat = Object.values(nahida ?? {}).filter((e) => e.category)
    expect(combat.length).toBeGreaterThan(0)
    for (const entry of combat) {
      expect(Object.keys(entry.dims).length).toBe(1)
    }
  })

  it('joins Noelle combat names as one dim', () => {
    const noelle = formulaCatalog.Noelle
    expect(noelle).toBeTruthy()
    const combat = Object.values(noelle ?? {}).filter((e) => e.category)
    expect(combat.length).toBeGreaterThan(0)
    for (const entry of combat) {
      expect(Object.keys(entry.dims).length).toBe(1)
    }
  })

  it('stamps register-time ele on skill/burst dmg, not infusion autos', () => {
    expect(formulaCatalog.Noelle?.burst?.dims.dmg?.ele).toBe('geo')
    expect(formulaCatalog.Noelle?.skill?.dims.dmg?.ele).toBe('geo')
    expect(formulaCatalog.Noelle?.c4?.dims.dmg?.ele).toBe('geo')
    expect(formulaCatalog.Noelle?.normal_0?.dims.dmg?.ele).toBeFalsy()
    expect(formulaCatalog.Noelle?.skill_shield?.dims.shield?.ele).toBe('geo')
  })

  it('assigns talent categories to kit params without move', () => {
    expect(categoryFromName('skill_cd')).toBe('skill')
    expect(categoryFromName('burst_duration')).toBe('burst')
    expect(categoryFromName('charged_stamina')).toBe('auto')
    expect(categoryFromName('a1_cd')).toBe('passive1')
    expect(categoryFromName('c2_charged_dmg_')).toBe('constellation2')
    expect(categoryFromName('c4')).toBe('constellation4')

    const catalog = buildFormulaCatalog([
      {
        catalogSheet: 'Noelle',
        name: 'skill_cd',
        dim: 'param',
        tag: {
          et: 'own',
          qt: 'formula',
          q: 'param',
          sheet: 'Noelle',
          name: 'skill_cd',
        },
      },
      {
        catalogSheet: 'Noelle',
        name: 'skill_shield',
        dim: 'shield',
        tag: {
          et: 'own',
          qt: 'formula',
          q: 'shield',
          sheet: 'Noelle',
          name: 'skill_shield',
        },
      },
      {
        catalogSheet: 'Noelle',
        name: 'c4',
        dim: 'dmg',
        tag: {
          et: 'own',
          qt: 'formula',
          q: 'dmg',
          sheet: 'Noelle',
          move: 'elemental',
          name: 'c4',
        },
      },
    ])
    expect(catalog.Noelle?.skill_cd?.category).toBe('skill')
    expect(catalog.Noelle?.skill_cd?.exposeInProd).toBe(false)
    expect(catalog.Noelle?.skill_shield?.category).toBe('skill')
    expect(catalog.Noelle?.skill_shield?.exposeInProd).toBe(true)
    expect(catalog.Noelle?.c4?.category).toBe('constellation4')
  })
})
