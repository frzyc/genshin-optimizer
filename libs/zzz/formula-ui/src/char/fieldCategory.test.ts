import { describe, expect, it } from 'vitest'
import { formulaFieldGroupKey } from '../bundledFormulaGrouping'
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
        { sheet: 'Anby', name: 'BasicAttackTurboVolt_0' },
        index
      )
    ).toBe('basic')
  })

  it('keys aftershock variants separately from normal hits with the same name', () => {
    const index = buildFieldCategoryIndex('Anby')
    const normalKey = formulaFieldGroupKey({
      sheet: 'Anby',
      name: 'BasicAttackTurboVolt_0',
    })
    const aftershockKey = formulaFieldGroupKey({
      sheet: 'Anby',
      name: 'BasicAttackTurboVolt_0',
      damageType2: 'aftershock',
    })

    expect(index.get(normalKey)).toBe('basic')
    expect(index.get(aftershockKey)).toBeUndefined()
  })

  it('caches via getOrBuildCategoryIndex', () => {
    const first = getOrBuildCategoryIndex('Anby')
    const second = getOrBuildCategoryIndex('Anby')
    expect(second).toBe(first)
  })
})
