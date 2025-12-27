import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allPathKeys, allRarityKeys } from '@genshin-optimizer/sr/consts'
import { SroDatabase } from '../Database'
import { lightConeSortKeys } from './DisplayLightConeEntry'

describe('DisplayLightConeEntry.validate', () => {
  let database: SroDatabase
  let displayLightCone: ReturnType<typeof database.displayLightCone>

  beforeEach(() => {
    const dbStorage = createTestDBStorage('sro')
    database = new SroDatabase(1, dbStorage)
    displayLightCone = database.displayLightCone
  })

  it('should validate valid DisplayLightCone', () => {
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

  it('should return undefined for non-object types', () => {
    expect(displayLightCone['validate'](null)).toBeUndefined()
  })

  it('should apply default sortType for invalid value', () => {
    const invalid = {
      sortType: 'INVALID',
      ascending: false,
      rarity: [...allRarityKeys],
      path: [...allPathKeys],
    }
    const result = displayLightCone['validate'](invalid)
    expect(result).toBeDefined()
    expect(result?.sortType).toBe(lightConeSortKeys[0])
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

  it('should filter invalid path values', () => {
    const invalid = {
      sortType: 'level' as const,
      ascending: false,
      rarity: [...allRarityKeys],
      path: ['INVALID', allPathKeys[0]],
    }
    const result = displayLightCone['validate'](invalid)
    expect(result).toBeDefined()
    expect(result?.path).toEqual([allPathKeys[0]])
  })
})
