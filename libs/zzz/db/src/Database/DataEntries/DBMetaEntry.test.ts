import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allCharacterKeys } from '@genshin-optimizer/zzz/consts'
import { ZzzDatabase } from '../Database'

describe('DBMetaEntry.validate', () => {
  let database: ZzzDatabase
  let dbMeta: ReturnType<typeof database.dbMeta>

  beforeEach(() => {
    const dbStorage = createTestDBStorage('zzz')
    database = new ZzzDatabase(1, dbStorage)
    dbMeta = database.dbMeta
  })

  describe('valid inputs', () => {
    it('should validate valid DBMeta', () => {
      const valid = { name: 'Test DB', lastEdit: 12345 }
      const result = dbMeta['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.name).toBe('Test DB')
      expect(result?.lastEdit).toBe(12345)
    })

    it('should validate with optCharKey', () => {
      const valid = {
        name: 'Test DB',
        lastEdit: 12345,
        optCharKey: allCharacterKeys[0],
      }
      const result = dbMeta['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.optCharKey).toBe(allCharacterKeys[0])
    })

    it('should validate with optional optCharKey undefined', () => {
      const valid = { name: 'Test DB', lastEdit: 12345, optCharKey: undefined }
      const result = dbMeta['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.optCharKey).toBeUndefined()
    })
  })

  describe('invalid types', () => {
    it('should return undefined for non-object types', () => {
      expect(dbMeta['validate'](null)).toBeUndefined()
      expect(dbMeta['validate'](undefined)).toBeUndefined()
      expect(dbMeta['validate']('string')).toBeUndefined()
      expect(dbMeta['validate'](123)).toBeUndefined()
      expect(dbMeta['validate'](true)).toBeUndefined()
      expect(dbMeta['validate']([])).toBeUndefined()
    })
  })

  describe('default values', () => {
    it('should apply default name if missing', () => {
      const partial = { lastEdit: 12345 }
      const result = dbMeta['validate'](partial)
      expect(result).toBeDefined()
      expect(result?.name).toBe('Database 1')
    })

    it('should apply default name if invalid type', () => {
      const partial = { name: 123, lastEdit: 12345 }
      const result = dbMeta['validate'](partial)
      expect(result).toBeDefined()
      expect(result?.name).toBe('Database 1')
    })

    it('should apply default lastEdit if missing', () => {
      const partial = { name: 'Test' }
      const result = dbMeta['validate'](partial)
      expect(result).toBeDefined()
      expect(result?.lastEdit).toBe(0)
    })

    it('should apply default lastEdit if invalid type', () => {
      const partial = { name: 'Test', lastEdit: 'invalid' }
      const result = dbMeta['validate'](partial)
      expect(result).toBeDefined()
      expect(result?.lastEdit).toBe(0)
    })
  })

  describe('invalid enum values', () => {
    it('should remove invalid optCharKey', () => {
      const invalid = {
        name: 'Test',
        lastEdit: 12345,
        optCharKey: 'INVALID_KEY',
      }
      const result = dbMeta['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.optCharKey).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('should handle empty object', () => {
      const result = dbMeta['validate']({})
      expect(result).toBeDefined()
      expect(result?.name).toBe('Database 1')
      expect(result?.lastEdit).toBe(0)
    })

    it('should handle extra fields', () => {
      const withExtra = {
        name: 'Test',
        lastEdit: 12345,
        extraField: 'should be ignored',
      }
      const result = dbMeta['validate'](withExtra)
      expect(result).toBeDefined()
      expect(result?.name).toBe('Test')
      expect(result?.lastEdit).toBe(12345)
    })
  })
})
