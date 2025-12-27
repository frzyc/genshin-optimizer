import { createTestDBStorage } from '@genshin-optimizer/common/database'
import {
  allRelicSetKeys,
  relicMaxLevel,
  relicSlotToMainStatKeys,
} from '@genshin-optimizer/sr/consts'
import { SroDatabase } from '../Database'
import {
  maxBuildsToShowDefault,
  maxBuildsToShowList,
} from './OptConfigDataManager'

describe('OptConfigDataManager.validate', () => {
  let database: SroDatabase
  let optConfigs: ReturnType<typeof database.optConfigs>

  beforeEach(() => {
    const dbStorage = createTestDBStorage('sro')
    database = new SroDatabase(1, dbStorage)
    optConfigs = database.optConfigs
  })

  it('should validate valid OptConfig', () => {
    const valid = {
      statFilters: [],
      maxBuildsToShow: 5,
      levelLow: 0,
      levelHigh: 15,
      head: [],
      hands: [],
      body: [],
      feet: [],
      planarSphere: [],
      linkRope: [],
      setFilter2: [],
      setFilter4: [],
      useEquipped: false,
      useEquippedLightCone: false,
    }
    const result = optConfigs['validate'](valid)
    expect(result).toBeDefined()
    expect(result?.maxBuildsToShow).toBe(5)
  })

  it('should return undefined for non-object types', () => {
    expect(optConfigs['validate'](null)).toBeUndefined()
  })

  it('should apply default statFilters if not array', () => {
    const invalid = {
      statFilters: 'not an array',
      maxBuildsToShow: 5,
    }
    const result = optConfigs['validate'](invalid)
    expect(result).toBeDefined()
    expect(result?.statFilters).toEqual([])
  })

  it('should apply default maxBuildsToShow for invalid value', () => {
    const invalid = {
      statFilters: [],
      maxBuildsToShow: 999,
    }
    const result = optConfigs['validate'](invalid)
    expect(result).toBeDefined()
    expect(result?.maxBuildsToShow).toBe(maxBuildsToShowDefault)
  })

  it('should filter invalid setFilter2Cavern values', () => {
    const invalid = {
      statFilters: [],
      maxBuildsToShow: 5,
      setFilter2Cavern: ['INVALID' as any, allRelicSetKeys[0]],
    }
    const result = optConfigs['validate'](invalid)
    expect(result).toBeDefined()
    expect(result?.setFilter2Cavern).toEqual([allRelicSetKeys[0]])
  })

  it('should validate all valid maxBuildsToShow values', () => {
    maxBuildsToShowList.forEach((maxBuilds) => {
      const valid = {
        statFilters: [],
        maxBuildsToShow: maxBuilds,
      }
      const result = optConfigs['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.maxBuildsToShow).toBe(maxBuilds)
    })
  })
})
