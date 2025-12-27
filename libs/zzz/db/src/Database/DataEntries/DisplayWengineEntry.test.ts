import { createTestDBStorage } from '@genshin-optimizer/common/database'
import {
  allLocationKeys,
  allSpecialityKeys,
  allWengineRarityKeys,
} from '@genshin-optimizer/zzz/consts'
import { ZzzDatabase } from '../Database'
import { wengineSortKeys } from './DisplayWengineEntry'

describe('DisplayWengineEntry.validate', () => {
  let database: ZzzDatabase
  let displayWengine: ReturnType<typeof database.displayWengine>

  beforeEach(() => {
    const dbStorage = createTestDBStorage('zzz')
    database = new ZzzDatabase(1, dbStorage)
    displayWengine = database.displayWengine
  })

  describe('valid inputs', () => {
    it('should validate valid DisplayWengine', () => {
      const valid = {
        editWengineId: 'test-id',
        sortType: 'level' as const,
        ascending: false,
        rarity: [...allWengineRarityKeys],
        speciality: [...allSpecialityKeys],
        locked: ['locked', 'unlocked'] as const,
        showInventory: true,
        showEquipped: true,
        locations: [],
      }
      const result = displayWengine['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.editWengineId).toBe('test-id')
      expect(result?.sortType).toBe('level')
      expect(result?.ascending).toBe(false)
      expect(result?.rarity).toEqual(allWengineRarityKeys)
      expect(result?.speciality).toEqual(allSpecialityKeys)
      expect(result?.locked).toEqual(['locked', 'unlocked'])
      expect(result?.showInventory).toBe(true)
      expect(result?.showEquipped).toBe(true)
      expect(result?.locations).toEqual([])
    })

    it('should validate with empty editWengineId', () => {
      const valid = {
        editWengineId: '',
        sortType: 'rarity' as const,
        ascending: true,
        rarity: [allWengineRarityKeys[0]],
        speciality: [allSpecialityKeys[0]],
        locked: ['locked'] as const,
        showInventory: false,
        showEquipped: false,
        locations: [allLocationKeys[0]],
      }
      const result = displayWengine['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.editWengineId).toBe('')
      expect(result?.ascending).toBe(true)
      expect(result?.showInventory).toBe(false)
      expect(result?.showEquipped).toBe(false)
    })
  })

  describe('invalid types', () => {
    it('should return undefined for non-object types', () => {
      expect(displayWengine['validate'](null)).toBeUndefined()
      expect(displayWengine['validate'](undefined)).toBeUndefined()
      expect(displayWengine['validate']('string')).toBeUndefined()
      expect(displayWengine['validate'](123)).toBeUndefined()
      expect(displayWengine['validate'](true)).toBeUndefined()
      expect(displayWengine['validate']([])).toBeUndefined()
    })

    it('should return undefined if editWengineId is not a string', () => {
      const invalid = {
        editWengineId: 123,
        sortType: 'level' as const,
        ascending: false,
        rarity: [...allWengineRarityKeys],
        speciality: [...allSpecialityKeys],
        locked: ['locked', 'unlocked'] as const,
        showInventory: true,
        showEquipped: true,
        locations: [],
      }
      expect(displayWengine['validate'](invalid)).toBeUndefined()
    })
  })

  describe('default values', () => {
    it('should apply default sortType for invalid value', () => {
      const invalid = {
        editWengineId: '',
        sortType: 'INVALID',
        ascending: false,
        rarity: [...allWengineRarityKeys],
        speciality: [...allSpecialityKeys],
        locked: ['locked', 'unlocked'] as const,
        showInventory: true,
        showEquipped: true,
        locations: [],
      }
      const result = displayWengine['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.sortType).toBe(wengineSortKeys[0])
    })

    it('should apply default ascending if missing', () => {
      const partial = {
        editWengineId: '',
        sortType: 'level' as const,
        rarity: [...allWengineRarityKeys],
        speciality: [...allSpecialityKeys],
        locked: ['locked', 'unlocked'] as const,
        showInventory: true,
        showEquipped: true,
        locations: [],
      }
      const result = displayWengine['validate'](partial)
      expect(result).toBeDefined()
      expect(result?.ascending).toBe(false)
    })

    it('should apply default showEquipped if missing', () => {
      const partial = {
        editWengineId: '',
        sortType: 'level' as const,
        ascending: false,
        rarity: [...allWengineRarityKeys],
        speciality: [...allSpecialityKeys],
        locked: ['locked', 'unlocked'] as const,
        showInventory: true,
        locations: [],
      }
      const result = displayWengine['validate'](partial)
      expect(result).toBeDefined()
      expect(result?.showEquipped).toBe(true)
    })

    it('should apply default showInventory if missing', () => {
      const partial = {
        editWengineId: '',
        sortType: 'level' as const,
        ascending: false,
        rarity: [...allWengineRarityKeys],
        speciality: [...allSpecialityKeys],
        locked: ['locked', 'unlocked'] as const,
        showEquipped: true,
        locations: [],
      }
      const result = displayWengine['validate'](partial)
      expect(result).toBeDefined()
      expect(result?.showInventory).toBe(true)
    })
  })

  describe('array validation', () => {
    it('should filter invalid rarity values', () => {
      const invalid = {
        editWengineId: '',
        sortType: 'level' as const,
        ascending: false,
        rarity: ['INVALID', allWengineRarityKeys[0]],
        speciality: [...allSpecialityKeys],
        locked: ['locked', 'unlocked'] as const,
        showInventory: true,
        showEquipped: true,
        locations: [],
      }
      const result = displayWengine['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.rarity).toEqual([allWengineRarityKeys[0]])
    })

    it('should filter invalid speciality values', () => {
      const invalid = {
        editWengineId: '',
        sortType: 'level' as const,
        ascending: false,
        rarity: [...allWengineRarityKeys],
        speciality: [allSpecialityKeys[0], 'INVALID'],
        locked: ['locked', 'unlocked'] as const,
        showInventory: true,
        showEquipped: true,
        locations: [],
      }
      const result = displayWengine['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.speciality).toEqual([allSpecialityKeys[0]])
    })

    it('should filter invalid locked values', () => {
      const invalid = {
        editWengineId: '',
        sortType: 'level' as const,
        ascending: false,
        rarity: [...allWengineRarityKeys],
        speciality: [...allSpecialityKeys],
        locked: ['locked', 'INVALID'],
        showInventory: true,
        showEquipped: true,
        locations: [],
      }
      const result = displayWengine['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.locked).toEqual(['locked'])
    })

    it('should filter invalid locations values', () => {
      const invalid = {
        editWengineId: '',
        sortType: 'level' as const,
        ascending: false,
        rarity: [...allWengineRarityKeys],
        speciality: [...allSpecialityKeys],
        locked: ['locked', 'unlocked'] as const,
        showInventory: true,
        showEquipped: true,
        locations: ['INVALID', allLocationKeys[0]],
      }
      const result = displayWengine['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.locations).toEqual([allLocationKeys[0]])
    })
  })

  describe('edge cases', () => {
    it('should validate all valid sortType values', () => {
      wengineSortKeys.forEach((sortKey) => {
        const valid = {
          editWengineId: '',
          sortType: sortKey,
          ascending: false,
          rarity: [...allWengineRarityKeys],
          speciality: [...allSpecialityKeys],
          locked: ['locked', 'unlocked'] as const,
          showInventory: true,
          showEquipped: true,
          locations: [],
        }
        const result = displayWengine['validate'](valid)
        expect(result).toBeDefined()
        expect(result?.sortType).toBe(sortKey)
      })
    })
  })
})
