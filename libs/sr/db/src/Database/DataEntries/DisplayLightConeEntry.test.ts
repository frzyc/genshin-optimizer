import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allPathKeys, allRarityKeys } from '@genshin-optimizer/sr/consts'
import { SroDatabase } from '../Database'
import { lightConeSortKeys } from './DisplayLightConeEntry'

describe('DisplayLightConeEntry.validate', () => {
  let database: SroDatabase
  let displayLightCone: SroDatabase['displayLightCone']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('sro')
    database = new SroDatabase(1, dbStorage)
    displayLightCone = database.displayLightCone
  })

  it('should validate complete DisplayLightCone', () => {
    const valid = {
      sortType: 'level' as const,
      ascending: false,
      rarity: [...allRarityKeys],
      path: [...allPathKeys],
    }
    const result = displayLightCone['validate'](valid)
    expect(result).toBeDefined()
    expect(result?.sortType).toBe('level')
  })

  it('should validate all sortType values', () => {
    lightConeSortKeys.forEach((sortKey) => {
      const valid = {
        sortType: sortKey,
        ascending: false,
        rarity: [...allRarityKeys],
        path: [...allPathKeys],
      }
      const result = displayLightCone['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.sortType).toBe(sortKey)
    })
  })

  it('should filter invalid rarity values', () => {
    const invalid = {
      sortType: 'level' as const,
      ascending: false,
      rarity: ['INVALID', allRarityKeys[0]],
      path: [...allPathKeys],
    }
    const result = displayLightCone['validate'](invalid)
    expect(result).toBeDefined()
    expect(result?.rarity).toEqual([allRarityKeys[0]])
  })
})
