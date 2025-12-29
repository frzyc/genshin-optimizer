import { createTestDBStorage } from '@genshin-optimizer/common/database'
import {
  allLightConeKeys,
  lightConeMaxLevel,
} from '@genshin-optimizer/sr/consts'
import { SroDatabase } from '../Database'

describe('LightConeDataManager.validate', () => {
  let database: SroDatabase
  let lightCones: SroDatabase['lightCones']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('sro')
    database = new SroDatabase(1, dbStorage)
    lightCones = database.lightCones
  })

  it('should reject invalid light cone key', () => {
    const invalid = {
      key: 'INVALID_KEY',
      level: 50,
      ascension: 3,
      superimpose: 1,
      location: '',
      lock: false,
    }
    expect(lightCones['validate'](invalid)).toBeUndefined()
  })

  it('should reject level exceeding max', () => {
    const invalid = {
      key: allLightConeKeys[0],
      level: lightConeMaxLevel + 1,
      ascension: 3,
      superimpose: 1,
      location: '',
      lock: false,
    }
    expect(lightCones['validate'](invalid)).toBeUndefined()
  })

  it('should clamp superimpose to valid range [1, 5]', () => {
    const invalid = {
      key: allLightConeKeys[0],
      level: 50,
      ascension: 3,
      superimpose: 10,
      location: '',
      lock: false,
    }
    const result = lightCones['validate'](invalid)
    expect(result).toBeDefined()
    expect(result?.superimpose).toBe(5)
  })

  it('should clear invalid location to empty string', () => {
    const invalid = {
      key: allLightConeKeys[0],
      level: 50,
      ascension: 3,
      superimpose: 1,
      location: 'INVALID_LOCATION',
      lock: false,
    }
    const result = lightCones['validate'](invalid)
    expect(result).toBeDefined()
    expect(result?.location).toBe('')
  })
})
