import { describe, expect, it } from 'vitest'
import {
  type AbilityDim,
  abilityBaseName,
  bundledFormulaInSheet,
  formulaMetaKey,
  isAbilityDim,
} from './formulaMeta'
import { formulas } from './meta'

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

  it('resolves every bundled ability formula in generated meta', () => {
    for (const [sheet, sheetFormulas] of Object.entries(formulas)) {
      for (const entry of Object.values(sheetFormulas)) {
        const tag = entry.tag
        if (tag?.qt !== 'formula' || !tag.name || !isAbilityDim(tag.q)) continue

        const q = tag.q as AbilityDim
        const label = `${sheet}/${tag.name}:${q}`
        expect(bundledFormulaInSheet(sheetFormulas, tag.name, q), label).toBe(
          entry
        )
      }
    }
  })

  it('round-trips persisted opt-target identity', () => {
    const entry = formulas.Yixuan['BasicAttackCirrusStrike_0:sheerDmg']
    const { tag } = entry
    expect(
      bundledFormulaInSheet(formulas.Yixuan, tag.name!, tag.q! as AbilityDim)
    ).toBe(entry)
  })

  it('does not return a bare singleton for a different ability dim', () => {
    const sheetFormulas = {
      BasicAttack_0: {
        tag: { name: 'BasicAttack_0', q: 'standardDmg' },
      },
    }
    expect(
      bundledFormulaInSheet(sheetFormulas, 'BasicAttack_0', 'sheerDmg')
    ).toBeUndefined()
  })

  it('has at most one bundled ability entry per tag.name + ability dim', () => {
    const collisions = new Map<string, string[]>()

    for (const [sheet, sheetFormulas] of Object.entries(formulas)) {
      for (const entry of Object.values(sheetFormulas)) {
        const tag = entry.tag
        if (tag?.qt !== 'formula' || !tag.name || !isAbilityDim(tag.q)) continue

        const key = `${sheet}\0${tag.name}\0${tag.q}`
        const variants = collisions.get(key) ?? []
        variants.push(tag.damageType2 ?? '')
        collisions.set(key, variants)
      }
    }

    for (const [key, damageType2s] of collisions) {
      const unique = new Set(damageType2s)
      expect(unique.size, key).toBeLessThanOrEqual(1)
    }
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
