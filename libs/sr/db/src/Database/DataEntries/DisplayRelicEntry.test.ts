import { createTestDBStorage } from '@genshin-optimizer/common/database'
import {
  allRelicSetKeys,
  allRelicSubStatKeys,
} from '@genshin-optimizer/sr/consts'
import { SroDatabase } from '../Database'
import { initialFilterOption, relicSortKeys } from './DisplayRelicEntry'

describe('DisplayRelicEntry.validate', () => {
  let database: SroDatabase
  let displayRelic: SroDatabase['displayRelic']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('sro')
    database = new SroDatabase(1, dbStorage)
    displayRelic = database.displayRelic
  })

  it('should validate complete DisplayRelic', () => {
    const valid = {
      filterOption: initialFilterOption(),
      ascending: false,
      sortType: 'rarity' as const,
      effFilter: [...allRelicSubStatKeys],
    }
    const result = displayRelic['validate'](valid)
    expect(result).toBeDefined()
    expect(result?.sortType).toBe('rarity')
  })

  it('should clamp levelLow to valid range [0, 15]', () => {
    const invalid = {
      filterOption: {
        ...initialFilterOption(),
        levelLow: -5,
      },
      ascending: false,
      sortType: 'rarity' as const,
      effFilter: [...allRelicSubStatKeys],
    }
    const result = displayRelic['validate'](invalid)
    expect(result).toBeDefined()
    expect(result?.filterOption.levelLow).toBe(0)
  })

  it('should filter invalid relicSetKeys', () => {
    const invalid = {
      filterOption: {
        ...initialFilterOption(),
        relicSetKeys: ['INVALID', allRelicSetKeys[0]],
      },
      ascending: false,
      sortType: 'rarity' as const,
      effFilter: [...allRelicSubStatKeys],
    }
    const result = displayRelic['validate'](invalid)
    expect(result).toBeDefined()
    expect(result?.filterOption.relicSetKeys).toEqual([allRelicSetKeys[0]])
  })

  it('should validate all sortType values', () => {
    relicSortKeys.forEach((sortKey) => {
      const valid = {
        filterOption: initialFilterOption(),
        ascending: false,
        sortType: sortKey,
        effFilter: [...allRelicSubStatKeys],
      }
      const result = displayRelic['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.sortType).toBe(sortKey)
    })
  })
})
