import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allGenderKeys } from '@genshin-optimizer/gi/consts'
import { ArtCharDatabase } from '../ArtCharDatabase'

describe('DBMetaEntry.validate', () => {
  let database: ArtCharDatabase
  let dbMeta: ArtCharDatabase['dbMeta']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
    dbMeta = database.dbMeta
  })

  it('should validate valid DBMeta', () => {
    const valid = { name: 'Test DB', lastEdit: 12345, gender: 'F' as const }
    const result = dbMeta['validate'](valid)
    expect(result).toBeDefined()
    expect(result?.name).toBe('Test DB')
    expect(result?.lastEdit).toBe(12345)
    expect(result?.gender).toBe('F')
  })

  it('should return undefined for non-object types', () => {
    expect(dbMeta['validate'](null)).toBeUndefined()
  })

  it('should apply default name if missing', () => {
    const partial = { lastEdit: 12345, gender: 'F' as const }
    const result = dbMeta['validate'](partial)
    expect(result).toBeDefined()
    expect(result?.name).toBe('Database 1')
  })

  it('should apply default gender for invalid value', () => {
    const invalid = { name: 'Test', lastEdit: 12345, gender: 'INVALID' }
    const result = dbMeta['validate'](invalid)
    expect(result).toBeDefined()
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
})
