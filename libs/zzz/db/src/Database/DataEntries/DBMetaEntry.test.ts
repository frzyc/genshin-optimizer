import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allCharacterKeys } from '@genshin-optimizer/zzz/consts'
import { ZzzDatabase } from '../Database'

describe('DBMetaEntry', () => {
  let database: ZzzDatabase
  let dbMeta: ZzzDatabase['dbMeta']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('zzz')
    database = new ZzzDatabase(1, dbStorage)
    dbMeta = database.dbMeta
  })

  it('should validate complete DBMeta', () => {
    const valid = { name: 'Test DB', lastEdit: 12345 }
    const result = dbMeta['validate'](valid)
    expect(result).toBeDefined()
    expect(result?.name).toBe('Test DB')
    expect(result?.lastEdit).toBe(12345)
  })

  it('should validate with valid optCharKey', () => {
    const valid = {
      name: 'Test DB',
      lastEdit: 12345,
      optCharKey: allCharacterKeys[0],
    }
    const result = dbMeta['validate'](valid)
    expect(result?.optCharKey).toBe(allCharacterKeys[0])
  })

  it('should clear invalid optCharKey', () => {
    const invalid = {
      name: 'Test',
      lastEdit: 12345,
      optCharKey: 'INVALID_KEY',
    }
    const result = dbMeta['validate'](invalid)
    expect(result?.optCharKey).toBeUndefined()
  })
})
