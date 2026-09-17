import { describe, expect, it } from 'vitest'
import { groupFieldsByTag } from '../bundledFormulaFields'
import { formulaFieldGroupKey } from '../bundledFormulaGrouping'
import { charAbilityFormulaTags } from '../formulaFieldUtil'
import {
  buildAbilityFieldsBySkill,
  buildCharFormulaFields,
} from './charFormulaFields'
import { skillAbilityTextDocument } from './sheetDocuments'
import { injectAllAbilityFieldsIntoSkillDocuments } from './skillDocuments'

describe('buildAbilityFieldsBySkill', () => {
  it('includes both UltimateVoidstrike bundles for Soldier0Anby chain', () => {
    const tags = charAbilityFormulaTags('Soldier0Anby')
    const bySkill = buildAbilityFieldsBySkill('Soldier0Anby', tags)
    const chain = bySkill.chain?.UltimateVoidstrike
    expect(chain).toBeDefined()
    expect(chain!.length).toBe(2)
  })

  it('matches by parsed ability key, not the first underscore segment', () => {
    const tag = {
      sheet: 'Miyabi',
      name: 'SpecialAttackAzureFlash_Boundary_0',
      skillType: 'specialSkill',
      q: 'standardDmg',
      qt: 'formula',
    } as const
    const bySkill = buildAbilityFieldsBySkill('Miyabi', [tag])
    expect(bySkill.special?.SpecialAttackAzureFlash_Boundary).toBeDefined()
    expect(bySkill.special?.SpecialAttackAzureFlash).toBeUndefined()
  })
})

describe('buildCharFormulaFields', () => {
  it('lists static ability hits when calc listing is empty', () => {
    const { fields, abilityFieldsBySkill } = buildCharFormulaFields(
      'Soldier0Anby',
      []
    )
    const groupKeys = new Set(
      charAbilityFormulaTags('Soldier0Anby').map((tag) =>
        formulaFieldGroupKey(tag)
      )
    )
    expect(groupKeys.has('Soldier0Anby:UltimateVoidstrike_0:')).toBe(true)
    expect(
      groupKeys.has('Soldier0Anby:UltimateVoidstrike_aftershock0:aftershock')
    ).toBe(true)
    expect(abilityFieldsBySkill.chain?.UltimateVoidstrike?.length).toBe(2)
    expect(
      fields.filter((field) => {
        if (!('fieldRefs' in field)) return false
        const name = field.fieldRefs[0]?.ref.name ?? ''
        return name.startsWith('UltimateVoidstrike')
      })
    ).toHaveLength(2)
  })
})

describe('injectAllAbilityFieldsIntoSkillDocuments', () => {
  it('inserts fields after the matching ability header doc', () => {
    const tags = charAbilityFormulaTags('Soldier0Anby').filter((tag) =>
      tag.name?.startsWith('UltimateVoidstrike')
    )
    const fields = groupFieldsByTag(tags, {
      charKey: 'Soldier0Anby',
      skill: 'chain',
    })
    const staticDocs = [
      skillAbilityTextDocument({
        abilityKey: 'UltimateVoidstrike',
        header: { icon: null, text: 'Ult' },
        text: 'desc',
      }),
    ]
    const injected = injectAllAbilityFieldsIntoSkillDocuments(
      staticDocs,
      'chain',
      { chain: { UltimateVoidstrike: fields } }
    )
    expect(injected).toHaveLength(2)
    expect(injected[1]?.type).toBe('fields')
  })
})
