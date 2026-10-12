import { describe, expect, it } from 'vitest'
import { abilityBaseName, formulaMetaKey, isAbilityDim } from './formulaMeta'

describe('formulaMetaKey', () => {
  it('builds colon keys only when ambiguous', () => {
    expect(formulaMetaKey('BasicAttack_0', 'standardDmg', true)).toBe(
      'BasicAttack_0:standardDmg'
    )
    expect(formulaMetaKey('BasicAttack_0', 'sheerDmg', true)).toBe(
      'BasicAttack_0:sheerDmg'
    )
  })

  it('returns the name unchanged for singleton ability-dim listings', () => {
    expect(formulaMetaKey('standardDmgInst', 'standardDmg')).toBe(
      'standardDmgInst'
    )
    expect(formulaMetaKey('m6_dmg', 'standardDmg')).toBe('m6_dmg')
  })

  it('returns the name unchanged for non-ability-dim q', () => {
    expect(formulaMetaKey('anomalyDmgInst', 'anomalyDmg')).toBe(
      'anomalyDmgInst'
    )
  })
})

describe('abilityBaseName', () => {
  it('strips colon suffix from meta keys', () => {
    expect(abilityBaseName('BasicAttack_0:standardDmg')).toBe('BasicAttack_0')
  })
})

describe('isAbilityDim', () => {
  it('accepts bundled ability dims only', () => {
    expect(isAbilityDim('sheerDmg')).toBe(true)
    expect(isAbilityDim('atk')).toBe(false)
  })
})
