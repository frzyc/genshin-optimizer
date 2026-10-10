import type { Tag } from './data/util'
import { preserveListingFormulaQ } from './calculator'

const baseInner: Tag = {
  et: 'own',
  qt: 'formula',
  q: 'base',
  sheet: 'Noelle',
  name: 'skill_heal',
}

describe('preserveListingFormulaQ', () => {
  test('restores heal/shield/param over collapsed formula.base', () => {
    expect(
      preserveListingFormulaQ({ ...baseInner, q: 'heal' }, baseInner)?.q
    ).toBe('heal')
    expect(
      preserveListingFormulaQ(
        { et: 'own', qt: 'formula', q: 'param', name: 'burst_cd' },
        { et: 'own', qt: 'formula', q: 'base', name: 'burst_cd' }
      )?.q
    ).toBe('param')
    expect(
      preserveListingFormulaQ(
        { et: 'own', qt: 'formula', q: 'shield', name: 'skill_shield' },
        { et: 'own', qt: 'formula', q: 'base' }
      )
    ).toMatchObject({ q: 'shield', name: 'skill_shield' })
  })

  test('leaves dmg and non-base inner tags alone', () => {
    const dmg: Tag = { et: 'own', qt: 'formula', q: 'dmg', name: 'burst' }
    expect(preserveListingFormulaQ(dmg, { ...dmg, q: 'base' })?.q).toBe('base')
    expect(
      preserveListingFormulaQ(
        { ...baseInner, q: 'heal' },
        { ...baseInner, q: 'heal' }
      )?.q
    ).toBe('heal')
  })
})
