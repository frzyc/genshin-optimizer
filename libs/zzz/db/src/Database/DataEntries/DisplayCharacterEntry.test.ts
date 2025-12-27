import { createTestDBStorage } from '@genshin-optimizer/common/database'
import {
  allAttributeKeys,
  allCharacterRarityKeys,
  allSpecialityKeys,
} from '@genshin-optimizer/zzz/consts'
import { ZzzDatabase } from '../Database'
import { characterSortKeys } from './DisplayCharacterEntry'

describe('DisplayCharacterEntry.validate', () => {
  let database: ZzzDatabase
  let displayChar: ReturnType<typeof database.displayCharacter>

  beforeEach(() => {
    const dbStorage = createTestDBStorage('zzz')
    database = new ZzzDatabase(1, dbStorage)
    displayChar = database.displayCharacter
  })

  describe('valid inputs', () => {
    it('should validate valid DisplayCharacterEntry', () => {
      const valid = {
        sortType: 'level' as const,
        ascending: false,
        specialtyType: [...allSpecialityKeys],
        attribute: [...allAttributeKeys],
        rarity: [...allCharacterRarityKeys],
      }
      const result = displayChar['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.sortType).toBe('level')
      expect(result?.ascending).toBe(false)
      expect(result?.specialtyType).toEqual(allSpecialityKeys)
      expect(result?.attribute).toEqual(allAttributeKeys)
      expect(result?.rarity).toEqual(allCharacterRarityKeys)
    })

    it('should validate with ascending true', () => {
      const valid = {
        sortType: 'rarity' as const,
        ascending: true,
        specialtyType: [allSpecialityKeys[0]],
        attribute: [allAttributeKeys[0]],
        rarity: [allCharacterRarityKeys[0]],
      }
      const result = displayChar['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.ascending).toBe(true)
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
        specialtyType: [...allSpecialityKeys],
        attribute: [...allAttributeKeys],
        rarity: [...allCharacterRarityKeys],
      }
      const result = displayChar['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.sortType).toBe('level')
    })

    it('should disallow "new" as sortType', () => {
      const invalid = {
        sortType: 'new',
        ascending: false,
        specialtyType: [...allSpecialityKeys],
        attribute: [...allAttributeKeys],
        rarity: [...allCharacterRarityKeys],
      }
      const result = displayChar['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.sortType).toBe('level')
    })

    it('should apply default ascending if missing', () => {
      const partial = {
        sortType: 'level' as const,
        specialtyType: [...allSpecialityKeys],
        attribute: [...allAttributeKeys],
        rarity: [...allCharacterRarityKeys],
      }
      const result = displayChar['validate'](partial)
      expect(result).toBeDefined()
      expect(result?.ascending).toBe(false)
    })

    it('should apply default ascending if invalid type', () => {
      const invalid = {
        sortType: 'level' as const,
        ascending: 'not a boolean',
        specialtyType: [...allSpecialityKeys],
        attribute: [...allAttributeKeys],
        rarity: [...allCharacterRarityKeys],
      }
      const result = displayChar['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.ascending).toBe(false)
    })
  })

  describe('array validation', () => {
    it('should filter invalid specialtyType values', () => {
      const invalid = {
        sortType: 'level' as const,
        ascending: false,
        specialtyType: [allSpecialityKeys[0], 'INVALID', allSpecialityKeys[1]],
        attribute: [...allAttributeKeys],
        rarity: [...allCharacterRarityKeys],
      }
      const result = displayChar['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.specialtyType).toEqual([
        allSpecialityKeys[0],
        allSpecialityKeys[1],
      ])
    })

    it('should filter invalid attribute values', () => {
      const invalid = {
        sortType: 'level' as const,
        ascending: false,
        specialtyType: [...allSpecialityKeys],
        attribute: [allAttributeKeys[0], 'INVALID'],
        rarity: [...allCharacterRarityKeys],
      }
      const result = displayChar['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.attribute).toEqual([allAttributeKeys[0]])
    })

    it('should filter invalid rarity values', () => {
      const invalid = {
        sortType: 'level' as const,
        ascending: false,
        specialtyType: [...allSpecialityKeys],
        attribute: [...allAttributeKeys],
        rarity: ['INVALID', allCharacterRarityKeys[0]],
      }
      const result = displayChar['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.rarity).toEqual([allCharacterRarityKeys[0]])
    })

    it('should handle empty arrays', () => {
      const withEmpty = {
        sortType: 'level' as const,
        ascending: false,
        specialtyType: [],
        attribute: [],
        rarity: [],
      }
      const result = displayChar['validate'](withEmpty)
      expect(result).toBeDefined()
      expect(result?.specialtyType).toEqual([])
      expect(result?.attribute).toEqual([])
      expect(result?.rarity).toEqual([])
    })

    it('should handle non-array values for arrays', () => {
      const invalid = {
        sortType: 'level' as const,
        ascending: false,
        specialtyType: 'not an array',
        attribute: 123,
        rarity: null,
      }
      const result = displayChar['validate'](invalid)
      expect(result).toBeDefined()
      expect(Array.isArray(result?.specialtyType)).toBe(true)
      expect(Array.isArray(result?.attribute)).toBe(true)
      expect(Array.isArray(result?.rarity)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('should handle empty object', () => {
      const result = displayChar['validate']({})
      expect(result).toBeDefined()
      expect(result?.sortType).toBe('level')
      expect(result?.ascending).toBe(false)
    })

    it('should validate all valid sortType values', () => {
      characterSortKeys.forEach((sortKey) => {
        if (sortKey === 'new') return // "new" is explicitly disallowed
        const valid = {
          sortType: sortKey,
          ascending: false,
          specialtyType: [...allSpecialityKeys],
          attribute: [...allAttributeKeys],
          rarity: [...allCharacterRarityKeys],
        }
        const result = displayChar['validate'](valid)
        expect(result).toBeDefined()
        expect(result?.sortType).toBe(sortKey)
      })
    })
  })
})
