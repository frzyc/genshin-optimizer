import { describe, expect, it } from 'vitest'
import {
  filterExposedFormulaListings,
  shouldExposeFormulaListing,
  shouldIncludeStaticAbilityFields,
} from './formulaVisibility'

describe('formulaVisibility', () => {
  it('exposes generic inst formulas in production', () => {
    expect(
      shouldExposeFormulaListing(
        { qt: 'formula', name: 'anomalyBuildupInst' },
        { showDevComponents: false }
      )
    ).toBe(true)
  })

  it('hides per-ability formulas in production', () => {
    expect(
      shouldExposeFormulaListing(
        { qt: 'formula', name: 'BasicAttackTurboVolt_0' },
        { showDevComponents: false }
      )
    ).toBe(false)
  })

  it('filters listing reads with the same policy', () => {
    const reads = [
      { tag: { qt: 'formula', name: 'standardDmgInst' } },
      { tag: { qt: 'formula', name: 'BasicAttackTurboVolt_0' } },
    ]
    expect(
      filterExposedFormulaListings(reads, { showDevComponents: false })
    ).toHaveLength(1)
  })

  it('defaults static ability fields to dev mode', () => {
    expect(shouldIncludeStaticAbilityFields({ showDevComponents: false })).toBe(
      false
    )
    expect(shouldIncludeStaticAbilityFields({ showDevComponents: true })).toBe(
      true
    )
    expect(
      shouldIncludeStaticAbilityFields({
        showDevComponents: false,
        includeAbilityFields: true,
      })
    ).toBe(true)
  })
})
