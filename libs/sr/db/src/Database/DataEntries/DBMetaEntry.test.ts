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

  describe('valid inputs', () => {
    it('should validate valid DBMeta', () => {
      const valid = { name: 'Test DB', lastEdit: 12345, gender: 'F' as const }
      const result = dbMeta['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.name).toBe('Test DB')
      expect(result?.lastEdit).toBe(12345)
      expect(result?.gender).toBe('F')
    })

    it('should validate with gender M', () => {
      const valid = { name: 'Test DB', lastEdit: 12345, gender: 'M' as const }
      const result = dbMeta['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.gender).toBe('M')
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
      const partial = { lastEdit: 12345, gender: 'F' as const }
      const result = dbMeta['validate'](partial)
      expect(result).toBeDefined()
      expect(result?.name).toBe('Database 1')
    })

    it('should apply default lastEdit if missing', () => {
      const partial = { name: 'Test', gender: 'F' as const }
      const result = dbMeta['validate'](partial)
      expect(result).toBeDefined()
      expect(result?.lastEdit).toBe(0)
    })

    it('should apply default gender for invalid value', () => {
      const invalid = { name: 'Test', lastEdit: 12345, gender: 'INVALID' }
      const result = dbMeta['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.gender).toBe('F')
    })
  })

  describe('edge cases', () => {
    it('should handle empty object', () => {
      const result = dbMeta['validate']({})
      expect(result).toBeDefined()
      expect(result?.name).toBe('Database 1')
      expect(result?.lastEdit).toBe(0)
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
})
