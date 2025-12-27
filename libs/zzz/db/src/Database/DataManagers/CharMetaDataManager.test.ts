import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allCharacterKeys } from '@genshin-optimizer/zzz/consts'
import { ZzzDatabase } from '../Database'

describe('CharMetaDataManager.validate', () => {
  let database: ZzzDatabase
  let charMeta: ReturnType<typeof database.charMeta>

  beforeEach(() => {
    const dbStorage = createTestDBStorage('zzz')
    database = new ZzzDatabase(1, dbStorage)
    charMeta = database.charMeta
  })

  describe('valid inputs', () => {
    it('should validate valid ICharMeta', () => {
      const valid = { description: 'Test description' }
      const result = charMeta['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.description).toBe('Test description')
    })

    it('should validate with empty description', () => {
      const valid = { description: '' }
      const result = charMeta['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.description).toBe('')
    })
  })

  describe('invalid types', () => {
    it('should return undefined for non-object types', () => {
      expect(charMeta['validate'](null)).toBeUndefined()
      expect(charMeta['validate'](undefined)).toBeUndefined()
      expect(charMeta['validate']('string')).toBeUndefined()
      expect(charMeta['validate'](123)).toBeUndefined()
      expect(charMeta['validate'](true)).toBeUndefined()
      expect(charMeta['validate']([])).toBeUndefined()
    })
  })

  describe('default values', () => {
    it('should apply default description if missing', () => {
      const partial = {}
      const result = charMeta['validate'](partial)
      expect(result).toBeDefined()
      expect(result?.description).toBe('')
    })

    it('should apply default description if invalid type', () => {
      const invalid = { description: 123 }
      const result = charMeta['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.description).toBe('')
    })

    it('should apply default description if null', () => {
      const invalid = { description: null }
      const result = charMeta['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.description).toBe('')
    })
  })

  describe('edge cases', () => {
    it('should handle empty object', () => {
      const result = charMeta['validate']({})
      expect(result).toBeDefined()
      expect(result?.description).toBe('')
    })

    it('should handle extra fields', () => {
      const withExtra = {
        description: 'Test',
        extraField: 'should be ignored',
      }
      const result = charMeta['validate'](withExtra)
      expect(result).toBeDefined()
      expect(result?.description).toBe('Test')
      expect('extraField' in result!).toBe(false)
    })

    it('should handle long descriptions', () => {
      const longDesc = 'A'.repeat(10000)
      const valid = { description: longDesc }
      const result = charMeta['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.description).toBe(longDesc)
    })
  })

  describe('integration with database', () => {
    it('should get default value for non-existent key', () => {
      const result = charMeta.get(allCharacterKeys[0])
      expect(result).toBeDefined()
      expect(result.description).toBe('')
    })

    it('should set and get character meta', () => {
      const charKey = allCharacterKeys[0]
      charMeta.set(charKey, { description: 'Test meta' })
      const result = charMeta.get(charKey)
      expect(result.description).toBe('Test meta')
    })
  })
})
