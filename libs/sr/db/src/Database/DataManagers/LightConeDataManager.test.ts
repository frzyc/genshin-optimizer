import { createTestDBStorage } from '@genshin-optimizer/common/database'
import {
  allLightConeKeys,
  allLocationCharacterKeys,
  lightConeMaxLevel,
} from '@genshin-optimizer/sr/consts'
import { SroDatabase } from '../Database'

describe('LightConeDataManager.validate', () => {
  let database: SroDatabase
  let lightCones: ReturnType<typeof database.lightCones>

  beforeEach(() => {
    const dbStorage = createTestDBStorage('sro')
    database = new SroDatabase(1, dbStorage)
    lightCones = database.lightCones
  })

  it('should validate valid ILightCone', () => {
    const valid = {
      key: allLightConeKeys[0],
      level: 50,
      ascension: 3,
      superimpose: 1,
      location: '',
      lock: false,
    }
    const result = lightCones['validate'](valid)
    expect(result).toBeDefined()
    expect(result?.key).toBe(allLightConeKeys[0])
    expect(result?.level).toBe(50)
  })

  it('should return undefined for non-object types', () => {
    expect(lightCones['validate'](null)).toBeUndefined()
  })

  it('should return undefined for invalid key', () => {
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

  it('should return undefined for level exceeding max', () => {
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

  it('should clamp superimpose to valid range', () => {
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

  it('should clear invalid location', () => {
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

  it('should coerce lock to boolean', () => {
    const invalid = {
      key: allLightConeKeys[0],
      level: 50,
      ascension: 3,
      superimpose: 1,
      location: '',
      lock: 1,
    }
    const result = lightCones['validate'](invalid)
    expect(result).toBeDefined()
    expect(result?.lock).toBe(true)
  })
})
