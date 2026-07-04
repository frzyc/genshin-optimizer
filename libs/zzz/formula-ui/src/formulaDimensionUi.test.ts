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

  it('picks sheerDmg when a hit has no standardDmg sibling', () => {
    expect(
      resolveAbilityDim(sheetFormulas, 'BasicAttackCirrusStrike_0', 'dmg')
    ).toBe('sheerDmg')
  })

  it('maps UI dimension buckets to the bundled ability dim that exists in meta', () => {
    expect(
      resolveAbilityDim(sheetFormulas, 'BasicAttackCirrusStrike_0', 'daze')
    ).toBe('dazeBuildup')
    expect(
      resolveAbilityDim(
        sheetFormulas,
        'BasicAttackCirrusStrike_0',
        'anomBuildup'
      )
    ).toBe('anomBuildup')
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
  it('uses a longer anomaly label in dimension toggles than bundled row badges', () => {
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
