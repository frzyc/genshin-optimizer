import { createTestDBStorage } from '@genshin-optimizer/common/database'
import {
  allDiscRarityKeys,
  allDiscSetKeys,
  allDiscSlotKeys,
  allDiscSubStatKeys,
  allLocationKeys,
} from '@genshin-optimizer/zzz/consts'
import { ZzzDatabase } from '../Database'
import {
  discSortKeys,
  initialFilterOption,
  type FilterOption,
} from './DisplayDiscEntry'

describe('DisplayDiscEntry.validate', () => {
  let database: ZzzDatabase
  let displayDisc: ZzzDatabase['displayDisc']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('zzz')
    database = new ZzzDatabase(1, dbStorage)
    displayDisc = database.displayDisc
  })

  describe('valid inputs', () => {
    it('should validate valid DisplayDisc', () => {
      const valid = {
        filterOption: initialFilterOption(),
        ascending: false,
        sortType: 'rarity' as const,
        effFilter: [...allDiscSubStatKeys],
      }
      const result = displayDisc['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.ascending).toBe(false)
      expect(result?.sortType).toBe('rarity')
      expect(result?.effFilter).toEqual(allDiscSubStatKeys)
    })

    it('should validate with custom filterOption', () => {
      const customFilter: FilterOption = {
        discSetKeys: [allDiscSetKeys[0]],
        rarity: [allDiscRarityKeys[0]],
        levelLow: 5,
        levelHigh: 10,
        slotKeys: [allDiscSlotKeys[0]],
        mainStatKeys: [],
        substats: [],
        locations: [allLocationKeys[0]],
        showEquipped: false,
        showInventory: false,
        locked: ['locked'],
        rvLow: 100,
        rvHigh: 500,
        useMaxRV: true,
        lines: [3, 4],
      }
      const valid = {
        filterOption: customFilter,
        ascending: true,
        sortType: 'level' as const,
        effFilter: [allDiscSubStatKeys[0]],
      }
      const result = displayDisc['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.filterOption.levelLow).toBe(5)
      expect(result?.filterOption.levelHigh).toBe(10)
      expect(result?.filterOption.useMaxRV).toBe(true)
    })
  })

  describe('invalid types', () => {
    it('should return undefined for non-object types', () => {
      expect(displayDisc['validate'](null)).toBeUndefined()
      expect(displayDisc['validate'](undefined)).toBeUndefined()
      expect(displayDisc['validate']('string')).toBeUndefined()
      expect(displayDisc['validate'](123)).toBeUndefined()
      expect(displayDisc['validate'](true)).toBeUndefined()
      expect(displayDisc['validate']([])).toBeUndefined()
    })
  })

  describe('default values', () => {
    it('should apply default filterOption if missing', () => {
      const partial = {
        ascending: false,
        sortType: 'rarity' as const,
        effFilter: [...allDiscSubStatKeys],
      }
      const result = displayDisc['validate'](partial)
      expect(result).toBeDefined()
      expect(result?.filterOption).toEqual(initialFilterOption())
    })

    it('should apply default filterOption if invalid type', () => {
      const invalid = {
        filterOption: 'not an object',
        ascending: false,
        sortType: 'rarity' as const,
        effFilter: [...allDiscSubStatKeys],
      }
      const result = displayDisc['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.filterOption).toEqual(initialFilterOption())
    })

    it('should apply default ascending if missing', () => {
      const partial = {
        filterOption: initialFilterOption(),
        sortType: 'rarity' as const,
        effFilter: [...allDiscSubStatKeys],
      }
      const result = displayDisc['validate'](partial)
      expect(result).toBeDefined()
      expect(result?.ascending).toBe(false)
    })

    it('should apply default sortType for invalid value', () => {
      const invalid = {
        filterOption: initialFilterOption(),
        ascending: false,
        sortType: 'INVALID',
        effFilter: [...allDiscSubStatKeys],
      }
      const result = displayDisc['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.sortType).toBe(discSortKeys[0])
    })
  })

  describe('filterOption validation', () => {
    it('should clamp levelLow to valid range', () => {
      const invalid = {
        filterOption: {
          ...initialFilterOption(),
          levelLow: -5,
        },
        ascending: false,
        sortType: 'rarity' as const,
        effFilter: [...allDiscSubStatKeys],
      }
      const result = displayDisc['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.filterOption.levelLow).toBe(0)

      const invalid2 = {
        filterOption: {
          ...initialFilterOption(),
          levelLow: 20,
        },
        ascending: false,
        sortType: 'rarity' as const,
        effFilter: [...allDiscSubStatKeys],
      }
      const result2 = displayDisc['validate'](invalid2)
      expect(result2).toBeDefined()
      expect(result2?.filterOption.levelLow).toBe(15)
    })

    it('should clamp levelHigh to valid range', () => {
      const invalid = {
        filterOption: {
          ...initialFilterOption(),
          levelHigh: -5,
        },
        ascending: false,
        sortType: 'rarity' as const,
        effFilter: [...allDiscSubStatKeys],
      }
      const result = displayDisc['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.filterOption.levelHigh).toBe(0)

      const invalid2 = {
        filterOption: {
          ...initialFilterOption(),
          levelHigh: 20,
        },
        ascending: false,
        sortType: 'rarity' as const,
        effFilter: [...allDiscSubStatKeys],
      }
      const result2 = displayDisc['validate'](invalid2)
      expect(result2).toBeDefined()
      expect(result2?.filterOption.levelHigh).toBe(15)
    })

    it('should apply default levelLow if invalid type', () => {
      const invalid = {
        filterOption: {
          ...initialFilterOption(),
          levelLow: 'not a number',
        },
        ascending: false,
        sortType: 'rarity' as const,
        effFilter: [...allDiscSubStatKeys],
      }
      const result = displayDisc['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.filterOption.levelLow).toBe(0)
    })

    it('should apply default rvLow if invalid type', () => {
      const invalid = {
        filterOption: {
          ...initialFilterOption(),
          rvLow: 'not a number',
        },
        ascending: false,
        sortType: 'rarity' as const,
        effFilter: [...allDiscSubStatKeys],
      }
      const result = displayDisc['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.filterOption.rvLow).toBe(0)
    })

    it('should apply default rvHigh if invalid type', () => {
      const invalid = {
        filterOption: {
          ...initialFilterOption(),
          rvHigh: 'not a number',
        },
        ascending: false,
        sortType: 'rarity' as const,
        effFilter: [...allDiscSubStatKeys],
      }
      const result = displayDisc['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.filterOption.rvHigh).toBe(900)
    })

    it('should apply default useMaxRV if invalid type', () => {
      const invalid = {
        filterOption: {
          ...initialFilterOption(),
          useMaxRV: 'not a boolean',
        },
        ascending: false,
        sortType: 'rarity' as const,
        effFilter: [...allDiscSubStatKeys],
      }
      const result = displayDisc['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.filterOption.useMaxRV).toBe(false)
    })

    it('should apply default showEquipped if invalid type', () => {
      const invalid = {
        filterOption: {
          ...initialFilterOption(),
          showEquipped: 'not a boolean',
        },
        ascending: false,
        sortType: 'rarity' as const,
        effFilter: [...allDiscSubStatKeys],
      }
      const result = displayDisc['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.filterOption.showEquipped).toBe(true)
    })

    it('should apply default showInventory if invalid type', () => {
      const invalid = {
        filterOption: {
          ...initialFilterOption(),
          showInventory: 'not a boolean',
        },
        ascending: false,
        sortType: 'rarity' as const,
        effFilter: [...allDiscSubStatKeys],
      }
      const result = displayDisc['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.filterOption.showInventory).toBe(true)
    })
  })

  describe('array validation in filterOption', () => {
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
      expect(result).toBeDefined()
      expect(result?.filterOption.discSetKeys).toEqual([allDiscSetKeys[0]])
    })

    it('should filter invalid rarity', () => {
      const invalid = {
        filterOption: {
          ...initialFilterOption(),
          rarity: ['INVALID', allDiscRarityKeys[0]],
        },
        ascending: false,
        sortType: 'rarity' as const,
        effFilter: [...allDiscSubStatKeys],
      }
      const result = displayDisc['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.filterOption.rarity).toEqual([allDiscRarityKeys[0]])
    })

    it('should filter invalid slotKeys', () => {
      const invalid = {
        filterOption: {
          ...initialFilterOption(),
          slotKeys: ['INVALID', allDiscSlotKeys[0]],
        },
        ascending: false,
        sortType: 'rarity' as const,
        effFilter: [...allDiscSubStatKeys],
      }
      const result = displayDisc['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.filterOption.slotKeys).toEqual([allDiscSlotKeys[0]])
    })

    it('should filter invalid locked values', () => {
      const invalid = {
        filterOption: {
          ...initialFilterOption(),
          locked: ['INVALID', 'locked'],
        },
        ascending: false,
        sortType: 'rarity' as const,
        effFilter: [...allDiscSubStatKeys],
      }
      const result = displayDisc['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.filterOption.locked).toEqual(['locked'])
    })

    it('should filter invalid lines values', () => {
      const invalid = {
        filterOption: {
          ...initialFilterOption(),
          lines: [1, 5, 3],
        },
        ascending: false,
        sortType: 'rarity' as const,
        effFilter: [...allDiscSubStatKeys],
      }
      const result = displayDisc['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.filterOption.lines).toEqual([1, 3])
    })
  })

  describe('effFilter validation', () => {
    it('should filter invalid effFilter values', () => {
      const invalid = {
        filterOption: initialFilterOption(),
        ascending: false,
        sortType: 'rarity' as const,
        effFilter: ['INVALID', allDiscSubStatKeys[0]],
      }
      const result = displayDisc['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.effFilter).toEqual([allDiscSubStatKeys[0]])
    })
  })

  describe('edge cases', () => {
    it('should handle empty object', () => {
      const result = displayDisc['validate']({})
      expect(result).toBeDefined()
      expect(result?.filterOption).toEqual(initialFilterOption())
      expect(result?.ascending).toBe(false)
      expect(result?.sortType).toBe(discSortKeys[0])
    })

    it('should validate all valid sortType values', () => {
      discSortKeys.forEach((sortKey) => {
        const valid = {
          filterOption: initialFilterOption(),
          ascending: false,
          sortType: sortKey,
          effFilter: [...allDiscSubStatKeys],
        }
        const result = displayDisc['validate'](valid)
        expect(result).toBeDefined()
        expect(result?.sortType).toBe(sortKey)
      })
    })
  })
})
