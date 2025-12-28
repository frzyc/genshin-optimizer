import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { ArtCharDatabase } from '../ArtCharDatabase'
import {
  maxBuildsToShowDefault,
  maxBuildsToShowList,
} from './OptConfigDataManager'

describe('OptConfigDataManager.validate', () => {
  let database: ArtCharDatabase
  let optConfigs: ArtCharDatabase['optConfigs']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
    optConfigs = database.optConfigs
  })

  it('should validate valid OptConfig', () => {
    const valid = {
      statFilters: [],
      maxBuildsToShow: 5,
      levelLow: 0,
      levelHigh: 20,
      useEquipped: false,
      useEquippedArts: [],
    }
    const result = optConfigs['validate'](valid)
    expect(result).toBeDefined()
    expect(result?.maxBuildsToShow).toBe(5)
  })

  it('should return undefined for non-object types', () => {
    expect(optConfigs['validate'](null)).toBeUndefined()
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
