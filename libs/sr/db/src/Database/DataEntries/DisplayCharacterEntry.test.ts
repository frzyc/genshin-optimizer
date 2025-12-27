import { createTestDBStorage } from '@genshin-optimizer/common/database'
import {
  allElementalTypeKeys,
  allPathKeys,
  allRarityKeys,
} from '@genshin-optimizer/sr/consts'
import { SroDatabase } from '../Database'
import { characterSortKeys } from './DisplayCharacterEntry'

describe('DisplayCharacterEntry.validate', () => {
  let database: SroDatabase
  let displayChar: ReturnType<typeof database.displayCharacter>

  beforeEach(() => {
    const dbStorage = createTestDBStorage('sro')
    database = new SroDatabase(1, dbStorage)
    displayChar = database.displayCharacter
  })

  describe('valid inputs', () => {
    it('should validate valid DisplayCharacterEntry', () => {
      const valid = {
        sortType: 'level' as const,
        ascending: false,
        path: [...allPathKeys],
        elementalType: [...allElementalTypeKeys],
        rarity: [...allRarityKeys],
      }
      const result = displayChar['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.sortType).toBe('level')
      expect(result?.ascending).toBe(false)
    })
  })

  describe('invalid types', () => {
    it('should return undefined for non-object types', () => {
      expect(displayChar['validate'](null)).toBeUndefined()
      expect(displayChar['validate'](undefined)).toBeUndefined()
      expect(displayChar['validate']('string')).toBeUndefined()
      expect(displayChar['validate'](123)).toBeUndefined()
      expect(displayChar['validate'](true)).toBeUndefined()
      expect(displayChar['validate']([])).toBeUndefined()
    })
  })

  describe('default values', () => {
    it('should apply default sortType for invalid value', () => {
      const invalid = {
        sortType: 'INVALID',
        ascending: false,
        path: [...allPathKeys],
        elementalType: [...allElementalTypeKeys],
        rarity: [...allRarityKeys],
      }
      const result = displayChar['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.sortType).toBe('level')
    })

    it('should disallow "new" as sortType', () => {
      const invalid = {
        sortType: 'new',
        ascending: false,
        path: [...allPathKeys],
        elementalType: [...allElementalTypeKeys],
        rarity: [...allRarityKeys],
      }
      const result = displayChar['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.sortType).toBe('level')
    })

    it('should apply default ascending if missing', () => {
      const partial = {
        sortType: 'level' as const,
        path: [...allPathKeys],
        elementalType: [...allElementalTypeKeys],
        rarity: [...allRarityKeys],
      }
      const result = displayChar['validate'](partial)
      expect(result).toBeDefined()
      expect(result?.ascending).toBe(false)
    })
  })

  describe('array validation', () => {
    it('should filter invalid path values', () => {
      const invalid = {
        sortType: 'level' as const,
        ascending: false,
        path: [allPathKeys[0], 'INVALID', allPathKeys[1]],
        elementalType: [...allElementalTypeKeys],
        rarity: [...allRarityKeys],
      }
      const result = displayChar['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.path).toEqual([allPathKeys[0], allPathKeys[1]])
    })

    it('should filter invalid elementalType values', () => {
      const invalid = {
        sortType: 'level' as const,
        ascending: false,
        path: [...allPathKeys],
        elementalType: [allElementalTypeKeys[0], 'INVALID'],
        rarity: [...allRarityKeys],
      }
      const result = displayChar['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.elementalType).toEqual([allElementalTypeKeys[0]])
    })

    it('should filter invalid rarity values', () => {
      const invalid = {
        sortType: 'level' as const,
        ascending: false,
        path: [...allPathKeys],
        elementalType: [...allElementalTypeKeys],
        rarity: ['INVALID', allRarityKeys[0]],
      }
      const result = displayChar['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.rarity).toEqual([allRarityKeys[0]])
    })
  })

  describe('edge cases', () => {
    it('should handle empty object', () => {
      const result = displayChar['validate']({})
      expect(result).toBeDefined()
      expect(result?.sortType).toBe('level')
      expect(result?.ascending).toBe(false)
    })

    it('should validate all valid sortType values except "new"', () => {
      characterSortKeys.forEach((sortKey) => {
        if (sortKey === 'new') return
        const valid = {
          sortType: sortKey,
          ascending: false,
          path: [...allPathKeys],
          elementalType: [...allElementalTypeKeys],
          rarity: [...allRarityKeys],
        }
        const result = displayChar['validate'](valid)
        expect(result).toBeDefined()
        expect(result?.sortType).toBe(sortKey)
      })
    })
  })
})
