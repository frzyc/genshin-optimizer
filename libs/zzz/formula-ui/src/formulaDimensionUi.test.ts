import { abilityDims, formulas } from '@genshin-optimizer/zzz/formula'
import { describe, expect, it } from 'vitest'
import {
  ABILITY_DIM_LABEL,
  dimensionByAbilityDim,
  formulaDimensionLabel,
  optTargetShortValueLabel,
  resolveAbilityDim,
} from './formulaDimensionUi'

describe('resolveAbilityDim', () => {
  const sheetFormulas = formulas.Yixuan

  it('resolves sheerDmg when standard is absent', () => {
    expect(
      resolveAbilityDim(sheetFormulas, 'BasicAttackCirrusStrike_0', 'dmg')
    ).toBe('sheerDmg')
  })

  it('resolves dazeBuildup ability dim', () => {
    expect(
      resolveAbilityDim(sheetFormulas, 'BasicAttackCirrusStrike_0', 'daze')
    ).toBe('dazeBuildup')
  })
})

describe('dimensionByAbilityDim', () => {
  it('maps every ability dim to a UI dimension', () => {
    for (const q of abilityDims) {
      expect(dimensionByAbilityDim[q]).toBeDefined()
    }
  })
})

describe('formulaDimensionLabel', () => {
  it('uses longer anomaly label for dimension toggles', () => {
    expect(formulaDimensionLabel('anomBuildup')).toBe('Anomaly Buildup')
    expect(ABILITY_DIM_LABEL.anomBuildup).toBe('Anom')
  })
})

describe('optTargetShortValueLabel', () => {
  it('uses ability dim labels for formula targets', () => {
    expect(
      optTargetShortValueLabel({
        sheet: 'Yixuan',
        name: 'BasicAttackCirrusStrike_0',
        q: 'standardDmg',
      })
    ).toBe('DMG')
  })

  it('uses stat keys for stat targets', () => {
    expect(
      optTargetShortValueLabel({
        q: 'crit_',
        qt: 'final',
      })
    ).toBe('CRIT')
  })
})
