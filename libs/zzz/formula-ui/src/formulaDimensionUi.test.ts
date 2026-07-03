import { abilityDims, formulas } from '@genshin-optimizer/zzz/formula'
import { describe, expect, it } from 'vitest'
import {
  ABILITY_DIM_LABEL,
  dimensionByAbilityDim,
  formulaDimensionLabel,
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
