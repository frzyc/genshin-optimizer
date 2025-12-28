import { createTestDBStorage } from '@genshin-optimizer/common/database'
import {
  allLocationKeys,
  allWengineKeys,
  wengineMaxLevel,
} from '@genshin-optimizer/zzz/consts'
import { ZzzDatabase } from '../Database'

describe('WengineDataManager.validate', () => {
  let database: ZzzDatabase
  let wengines: ZzzDatabase['wengines']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('zzz')
    database = new ZzzDatabase(1, dbStorage)
    wengines = database.wengines
  })

  describe('valid inputs', () => {
    it('should validate valid IWengine', () => {
      const valid = {
        key: allWengineKeys[0],
        level: 50,
        modification: 3,
        phase: 2,
        location: '',
        lock: false,
      }
      const result = wengines['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.key).toBe(allWengineKeys[0])
      expect(result?.level).toBe(50)
      expect(result?.modification).toBe(4) // Level 50 requires modification 4
      expect(result?.phase).toBe(2)
      expect(result?.location).toBe('')
      expect(result?.lock).toBe(false)
    })

    it('should validate with location', () => {
      const valid = {
        key: allWengineKeys[0],
        level: 60,
        modification: 5,
        phase: 1,
        location: allLocationKeys[0],
        lock: true,
      }
      const result = wengines['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.location).toBe(allLocationKeys[0])
      expect(result?.lock).toBe(true)
    })

    it('should validate at max level', () => {
      const valid = {
        key: allWengineKeys[0],
        level: wengineMaxLevel,
        modification: 5,
        phase: 5,
        location: '',
        lock: false,
      }
      const result = wengines['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.level).toBe(wengineMaxLevel)
    })
  })

  describe('invalid types', () => {
    it('should return undefined for non-object types', () => {
      expect(wengines['validate'](null)).toBeUndefined()
      expect(wengines['validate'](undefined)).toBeUndefined()
      expect(wengines['validate']('string')).toBeUndefined()
      expect(wengines['validate'](123)).toBeUndefined()
      expect(wengines['validate'](true)).toBeUndefined()
      expect(wengines['validate']([])).toBeUndefined()
    })

    it('should return undefined for invalid key', () => {
      const invalid = {
        key: 'INVALID_KEY',
        level: 50,
        modification: 3,
        phase: 2,
        location: '',
        lock: false,
      }
      expect(wengines['validate'](invalid)).toBeUndefined()
    })

    it('should recover with default level if exceeding max', () => {
      const invalid = {
        key: allWengineKeys[0],
        level: wengineMaxLevel + 1,
        modification: 3,
        phase: 2,
        location: '',
        lock: false,
      }
      const result = wengines['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.level).toBe(1) // Falls back to default
    })
  })

  describe('default values and transformations', () => {
    it('should apply default phase if invalid', () => {
      const invalid = {
        key: allWengineKeys[0],
        level: 50,
        modification: 3,
        phase: 0,
        location: '',
        lock: false,
      }
      const result = wengines['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.phase).toBe(1)
    })

    it('should apply default phase if exceeds max', () => {
      const invalid = {
        key: allWengineKeys[0],
        level: 50,
        modification: 3,
        phase: 6,
        location: '',
        lock: false,
      }
      const result = wengines['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.phase).toBe(1)
    })

    it('should apply default phase if not a number', () => {
      const invalid = {
        key: allWengineKeys[0],
        level: 50,
        modification: 3,
        phase: 'not a number',
        location: '',
        lock: false,
      }
      const result = wengines['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.phase).toBe(1)
    })

    it('should clear invalid location', () => {
      const invalid = {
        key: allWengineKeys[0],
        level: 50,
        modification: 3,
        phase: 2,
        location: 'INVALID_LOCATION',
        lock: false,
      }
      const result = wengines['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.location).toBe('')
    })

    it('should coerce lock to boolean', () => {
      const invalid1 = {
        key: allWengineKeys[0],
        level: 50,
        modification: 3,
        phase: 2,
        location: '',
        lock: 1,
      }
      const result1 = wengines['validate'](invalid1)
      expect(result1).toBeDefined()
      expect(result1?.lock).toBe(true)

      const invalid2 = {
        key: allWengineKeys[0],
        level: 50,
        modification: 3,
        phase: 2,
        location: '',
        lock: 0,
      }
      const result2 = wengines['validate'](invalid2)
      expect(result2).toBeDefined()
      expect(result2?.lock).toBe(false)

      const invalid3 = {
        key: allWengineKeys[0],
        level: 50,
        modification: 3,
        phase: 2,
        location: '',
        lock: null,
      }
      const result3 = wengines['validate'](invalid3)
      expect(result3).toBeDefined()
      expect(result3?.lock).toBe(false)
    })
  })

  describe('level and milestone validation', () => {
    it('should sanitize level and modification', () => {
      const valid = {
        key: allWengineKeys[0],
        level: 50,
        modification: 3,
        phase: 2,
        location: '',
        lock: false,
      }
      const result = wengines['validate'](valid)
      expect(result).toBeDefined()
      expect(typeof result?.level).toBe('number')
      expect(typeof result?.modification).toBe('number')
    })
  })

  describe('edge cases', () => {
    it('should validate all valid phase values', () => {
      for (let phase = 1; phase <= 5; phase++) {
        const valid = {
          key: allWengineKeys[0],
          level: 50,
          modification: 3,
          phase,
          location: '',
          lock: false,
        }
        const result = wengines['validate'](valid)
        expect(result).toBeDefined()
        expect(result?.phase).toBe(phase)
      }
    })

    it('should validate all valid wengine keys', () => {
      allWengineKeys.forEach((key) => {
        const valid = {
          key,
          level: 50,
          modification: 3,
          phase: 2,
          location: '',
          lock: false,
        }
        const result = wengines['validate'](valid)
        expect(result).toBeDefined()
        expect(result?.key).toBe(key)
      })
    })

    it('should validate all valid location keys', () => {
      allLocationKeys.forEach((location) => {
        const valid = {
          key: allWengineKeys[0],
          level: 50,
          modification: 3,
          phase: 2,
          location,
          lock: false,
        }
        const result = wengines['validate'](valid)
        expect(result).toBeDefined()
        expect(result?.location).toBe(location)
      })
    })
  })
})
