import { describe, expect, it } from 'vitest'
import { dimLabel, optTargetShortValueLabel } from './dimLabels'

describe('dimLabel', () => {
  it('maps formula and stat dims', () => {
    expect(dimLabel('standardDmg')).toBe('DMG')
    expect(dimLabel('sheerDmg')).toBe('DMG')
    expect(dimLabel('dazeBuildup')).toBe('Daze')
    expect(dimLabel('anomBuildup')).toBe('Anom')
    expect(dimLabel('final')).toBe('Final')
    expect(dimLabel('initial')).toBe('Initial')
  })
})

describe('optTargetShortValueLabel', () => {
  it('uses dim labels for formula targets', () => {
    expect(optTargetShortValueLabel('standardDmg')).toBe('DMG')
    expect(optTargetShortValueLabel('dazeBuildup')).toBe('Daze')
  })

  it('uses stat keys for stat targets', () => {
    expect(optTargetShortValueLabel('final', 'crit_')).toBe('CRIT')
    expect(optTargetShortValueLabel('final', 'atk')).toBe('ATK')
  })
})
