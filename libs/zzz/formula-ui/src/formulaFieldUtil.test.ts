import { describe, expect, it } from 'vitest'
import { groupFieldsByTag } from './bundledFormulaFields'
import { formulaFieldGroupKey } from './bundledFormulaGrouping'
import {
  charAbilityFormulaTags,
  formulaListingTagKey,
} from './formulaFieldUtil'

describe('formulaListingTagKey', () => {
  it('includes qt and damage types for stable dedupe', () => {
    const tag = {
      sheet: 'Anby',
      name: 'Hit_0',
      q: 'standardDmg',
      qt: 'formula',
      damageType2: 'aftershock',
    } as const
    const base = { ...tag, damageType2: undefined }
    expect(formulaListingTagKey(tag)).not.toBe(formulaListingTagKey(base))
  })
})

describe('charAbilityFormulaTags', () => {
  it('includes normal and aftershock UltimateVoidstrike hits for Soldier0Anby', () => {
    const tags = charAbilityFormulaTags('Soldier0Anby')
    const groupKeys = new Set(tags.map((tag) => formulaFieldGroupKey(tag)))

    expect(groupKeys.has('Soldier0Anby:UltimateVoidstrike_0:')).toBe(true)
    expect(
      groupKeys.has('Soldier0Anby:UltimateVoidstrike_aftershock0:aftershock')
    ).toBe(true)
  })

  it('bundles both UltimateVoidstrike variants separately', () => {
    const fields = groupFieldsByTag(charAbilityFormulaTags('Soldier0Anby'), {
      charKey: 'Soldier0Anby',
      sheet: 'Soldier0Anby',
    })
    const ultBundles = fields.filter((field) => {
      if (!('fieldRefs' in field)) return false
      const name = field.fieldRefs[0]?.ref.name ?? ''
      return name.startsWith('UltimateVoidstrike')
    })
    expect(ultBundles).toHaveLength(2)
  })
})
