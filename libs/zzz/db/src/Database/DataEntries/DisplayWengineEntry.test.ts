import { createTestDBStorage } from '@genshin-optimizer/common/database'
import {
  allLocationKeys,
  allSpecialityKeys,
  allWengineRarityKeys,
} from '@genshin-optimizer/zzz/consts'
import { ZzzDatabase } from '../Database'
import { wengineSortKeys } from './DisplayWengineEntry'

describe('DisplayWengineEntry', () => {
  let database: ZzzDatabase
  let displayWengine: ZzzDatabase['displayWengine']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('zzz')
    database = new ZzzDatabase(1, dbStorage)
    displayWengine = database.displayWengine
  })

  it('should validate complete DisplayWengine', () => {
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
    expect(result?.sortType).toBe('level')
  })

  it('should validate all sortType values', () => {
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
      expect(result?.sortType).toBe(sortKey)
    })
  })

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
    expect(result?.rarity).toEqual([allWengineRarityKeys[0]])
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
    expect(result?.locations).toEqual([allLocationKeys[0]])
  })
})
