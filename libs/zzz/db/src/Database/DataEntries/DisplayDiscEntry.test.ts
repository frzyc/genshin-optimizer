import { createTestDBStorage } from '@genshin-optimizer/common/database'
import {
  allDiscSetKeys,
  allDiscSubStatKeys,
} from '@genshin-optimizer/zzz/consts'
import { ZzzDatabase } from '../Database'
import { discSortKeys, initialFilterOption } from './DisplayDiscEntry'

describe('DisplayDiscEntry', () => {
  let database: ZzzDatabase
  let displayDisc: ZzzDatabase['displayDisc']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('zzz')
    database = new ZzzDatabase(1, dbStorage)
    displayDisc = database.displayDisc
  })

  it('should validate complete DisplayDisc', () => {
    const valid = {
      filterOption: initialFilterOption(),
      ascending: false,
      sortType: 'rarity' as const,
      effFilter: [...allDiscSubStatKeys],
    }
    const result = displayDisc['validate'](valid)
    expect(result).toBeDefined()
    expect(result?.sortType).toBe('rarity')
  })

  it('should validate all sortType values', () => {
    discSortKeys.forEach((sortKey) => {
      const valid = {
        filterOption: initialFilterOption(),
        ascending: false,
        sortType: sortKey,
        effFilter: [...allDiscSubStatKeys],
      }
      const result = displayDisc['validate'](valid)
      expect(result?.sortType).toBe(sortKey)
    })
  })

  it('should clamp levelLow to [0, 15]', () => {
    const invalid = {
      filterOption: { ...initialFilterOption(), levelLow: -5 },
      ascending: false,
      sortType: 'rarity' as const,
      effFilter: [...allDiscSubStatKeys],
    }
    const result = displayDisc['validate'](invalid)
    expect(result?.filterOption.levelLow).toBe(0)

    const invalid2 = {
      filterOption: { ...initialFilterOption(), levelLow: 20 },
      ascending: false,
      sortType: 'rarity' as const,
      effFilter: [...allDiscSubStatKeys],
    }
    const result2 = displayDisc['validate'](invalid2)
    expect(result2?.filterOption.levelLow).toBe(15)
  })

  it('should filter invalid discSetKeys', () => {
    const invalid = {
      filterOption: {
        ...initialFilterOption(),
        discSetKeys: ['INVALID', allDiscSetKeys[0]],
      },
      ascending: false,
      sortType: 'rarity' as const,
      effFilter: [...allDiscSubStatKeys],
    }
    const result = displayDisc['validate'](invalid)
    expect(result?.filterOption.discSetKeys).toEqual([allDiscSetKeys[0]])
  })

  it('should filter invalid effFilter values', () => {
    const invalid = {
      filterOption: initialFilterOption(),
      ascending: false,
      sortType: 'rarity' as const,
      effFilter: ['INVALID', allDiscSubStatKeys[0]],
    }
    const result = displayDisc['validate'](invalid)
    expect(result?.effFilter).toEqual([allDiscSubStatKeys[0]])
  })
})
