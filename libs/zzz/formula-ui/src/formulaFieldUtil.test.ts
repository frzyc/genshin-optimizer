import { listingId } from '@genshin-optimizer/zzz/formula'
import { describe, expect, it } from 'vitest'
import { groupFieldsByTag } from './bundledFormulaFields'
import { charAbilityFormulaTags } from './formulaFieldUtil'

describe('listingId', () => {
  it('includes qt and damage types for stable dedupe', () => {
    const tag = {
      sheet: 'Anby',
      name: 'Hit_0',
      q: 'standardDmg',
      qt: 'formula',
      damageType2: 'aftershock',
    } as const
    const base = { ...tag, damageType2: undefined }
    expect(listingId(tag)).not.toBe(listingId(base))
  })
})

describe('charAbilityFormulaTags', () => {
  it('includes normal and aftershock UltimateVoidstrike hits for Soldier0Anby', () => {
    const tags = charAbilityFormulaTags('Soldier0Anby')
    const groupKeys = new Set(tags.map((tag) => `${tag.sheet}:${tag.name}`))

    expect(groupKeys.has('Soldier0Anby:UltimateVoidstrike_0')).toBe(true)
    expect(groupKeys.has('Soldier0Anby:UltimateVoidstrike_aftershock0')).toBe(
      true
    )
  })

  it('bundles both UltimateVoidstrike variants separately', () => {
    const fields = groupFieldsByTag(
      charAbilityFormulaTags('Soldier0Anby'),
      'Soldier0Anby'
    )
    const ultBundles = fields.filter((field) => {
      if (!('fieldRefs' in field)) return false
      const name = field.fieldRefs[0]?.ref.name ?? ''
      return name.startsWith('UltimateVoidstrike')
    })
    expect(ultBundles).toHaveLength(2)
  })
})
