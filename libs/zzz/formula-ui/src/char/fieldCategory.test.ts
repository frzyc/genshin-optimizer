import { describe, expect, it } from 'vitest'
import {
  buildFieldCategoryIndex,
  formulaTagKey,
  getFieldCategory,
  getOrBuildCategoryIndex,
} from './fieldCategory'

describe('buildFieldCategoryIndex', () => {
  it('maps listed formulas to their CharUISheet talent tab', () => {
    const index = buildFieldCategoryIndex('Anby')
    expect(index.size).toBeGreaterThan(0)
    expect(
      index.get(formulaTagKey({ sheet: 'Anby', name: 'BasicAttackTurboVolt_0' }))
    ).toBe('basic')
  })

  it('caches via getOrBuildCategoryIndex', () => {
    const first = getOrBuildCategoryIndex('Anby')
    const second = getOrBuildCategoryIndex('Anby')
    expect(second).toBe(first)
  })
})

describe('getFieldCategory', () => {
  it('uses an explicitly passed index', () => {
    const index = buildFieldCategoryIndex('Anby')
    expect(
      getFieldCategory(
        'Anby',
        { sheet: 'Anby', name: 'BasicAttackTurboVolt_0' },
        index
      )
    ).toBe('basic')
  })
})
