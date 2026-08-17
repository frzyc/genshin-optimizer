import { describe, expect, it } from 'vitest'
import { hitId } from '@genshin-optimizer/zzz/formula'
import {
  buildFieldCategoryIndex,
  getFieldCategory,
  getOrBuildCategoryIndex,
} from './fieldCategory'

describe('buildFieldCategoryIndex', () => {
  it('maps listed formulas to their CharUISheet talent tab', () => {
    const index = buildFieldCategoryIndex('Anby')
    expect(index.size).toBeGreaterThan(0)
    expect(
      getFieldCategory(
        'Anby',
        {
          sheet: 'Anby',
          name: 'BasicAttackTurboVolt_0',
          skillType: 'basicSkill',
          q: 'standardDmg',
        },
        index
      )
    ).toBe('basic')
  })

  it('categorizes ability formulas via skillType on the tag', () => {
    expect(
      getFieldCategory('Anby', {
        sheet: 'Anby',
        name: 'BasicAttackTurboVolt_0',
        skillType: 'basicSkill',
        q: 'standardDmg',
      })
    ).toBe('basic')
    expect(
      getFieldCategory('Anby', {
        sheet: 'Anby',
        name: 'BasicAttackTurboVolt_0',
        skillType: 'basicSkill',
        q: 'standardDmg',
        damageType2: 'aftershock',
      })
    ).toBe('basic')
  })

  it('indexes static buff fields by hitId', () => {
    const index = buildFieldCategoryIndex('Anby')
    const buffKey = hitId({ sheet: 'Anby', name: 'some_buff_field' })
    expect(index.has(buffKey)).toBe(false)
  })

  it('caches via getOrBuildCategoryIndex', () => {
    const first = getOrBuildCategoryIndex('Anby')
    const second = getOrBuildCategoryIndex('Anby')
    expect(second).toBe(first)
  })
})
