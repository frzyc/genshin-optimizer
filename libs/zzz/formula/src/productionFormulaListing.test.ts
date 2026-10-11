import { describe, expect, it } from 'vitest'
import {
  isProductionFormulaListing,
  isProductionFormulaName,
} from './productionFormulaListing'

describe('productionFormulaListing', () => {
  it('allows generic inst formulas in production', () => {
    expect(isProductionFormulaName('anomalyBuildupInst')).toBe(true)
    expect(isProductionFormulaName('standardDmgInst')).toBe(true)
  })

  it('rejects per-ability formula names in production', () => {
    expect(isProductionFormulaName('BasicAttackTurboVolt_0')).toBe(false)
  })

  it('allows non-formula listing tags', () => {
    expect(isProductionFormulaListing({ qt: 'final', name: undefined })).toBe(
      true
    )
  })

  it('filters formula listing tags by production name allowlist', () => {
    expect(
      isProductionFormulaListing({
        qt: 'formula',
        name: 'anomalyBuildupInst',
      })
    ).toBe(true)
    expect(
      isProductionFormulaListing({
        qt: 'formula',
        name: 'BasicAttackTurboVolt_0',
      })
    ).toBe(false)
  })
})
