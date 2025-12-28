import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allGenderKeys } from '@genshin-optimizer/sr/consts'
import { SroDatabase } from '../Database'

describe('DBMetaEntry.validate', () => {
  let database: SroDatabase
  let dbMeta: SroDatabase['dbMeta']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('sro')
    database = new SroDatabase(1, dbStorage)
    dbMeta = database.dbMeta
  })

  it('should validate complete DBMeta', () => {
    const valid = { name: 'Test DB', lastEdit: 12345, gender: 'F' as const }
    const result = dbMeta['validate'](valid)
    expect(result).toBeDefined()
    expect(result?.name).toBe('Test DB')
    expect(result?.lastEdit).toBe(12345)
    expect(result?.gender).toBe('F')
  })

  it('should validate all gender keys', () => {
    allGenderKeys.forEach((gender) => {
      const valid = { name: 'Test', lastEdit: 12345, gender }
      const result = dbMeta['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.gender).toBe(gender)
    })
  })

  it('should fall back to default gender for invalid value', () => {
    const invalid = { name: 'Test', lastEdit: 12345, gender: 'INVALID' }
    const result = dbMeta['validate'](invalid)
    expect(result).toBeDefined()
    expect(result?.gender).toBe('F')
  })
})
