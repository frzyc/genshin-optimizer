import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allWengineKeys } from '@genshin-optimizer/zzz/consts'
import { ZzzDatabase } from '../Database'

describe('WengineDataManager', () => {
  let database: ZzzDatabase
  let wengines: ZzzDatabase['wengines']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('zzz')
    database = new ZzzDatabase(1, dbStorage)
    wengines = database.wengines
  })

  it('should validate level/modification co-validation', () => {
    const valid = {
      key: allWengineKeys[0],
      level: 50,
      modification: 3,
      phase: 2,
      location: '',
      lock: false,
    }
    const result = wengines['validate'](valid)
    expect(result?.modification).toBe(4)
  })
})
