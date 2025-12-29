import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allLocationKeys, allWengineKeys } from '@genshin-optimizer/zzz/consts'
import { ZzzDatabase } from '../Database'

describe('WengineDataManager', () => {
  let database: ZzzDatabase
  let wengines: ZzzDatabase['wengines']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('zzz')
    database = new ZzzDatabase(1, dbStorage)
    wengines = database.wengines
  })

  it('should validate complete IWengine', () => {
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
  })

  it('should reject invalid wengine key', () => {
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

  it('should validate level/modification co-validation', () => {
    // Level 50 requires modification 4
    const valid = {
      key: allWengineKeys[0],
      level: 50,
      modification: 3, // Should be corrected to 4
      phase: 2,
      location: '',
      lock: false,
    }
    const result = wengines['validate'](valid)
    expect(result?.modification).toBe(4)
  })

  it('should validate all phase values [1-5]', () => {
    for (let phase = 1; phase <= 5; phase++) {
      const valid = {
        key: allWengineKeys[0],
        level: 50,
        modification: 4,
        phase,
        location: '',
        lock: false,
      }
      const result = wengines['validate'](valid)
      expect(result?.phase).toBe(phase)
    }
  })

  it('should clear invalid location', () => {
    const invalid = {
      key: allWengineKeys[0],
      level: 50,
      modification: 4,
      phase: 2,
      location: 'INVALID_LOCATION',
      lock: false,
    }
    const result = wengines['validate'](invalid)
    expect(result?.location).toBe('')
  })

  it('should validate with valid location', () => {
    const valid = {
      key: allWengineKeys[0],
      level: 60,
      modification: 5,
      phase: 1,
      location: allLocationKeys[0],
      lock: true,
    }
    const result = wengines['validate'](valid)
    expect(result?.location).toBe(allLocationKeys[0])
  })
})
