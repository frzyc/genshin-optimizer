import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allCharacterKeys } from '@genshin-optimizer/sr/consts'
import { SroDatabase } from '../Database'

describe('CharMetaDataManager.validate', () => {
  let database: SroDatabase
  let charMeta: SroDatabase['charMeta']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('sro')
    database = new SroDatabase(1, dbStorage)
    charMeta = database.charMeta
  })

  it('should validate valid ICharMeta', () => {
    const valid = { favorite: true }
    const result = charMeta['validate'](valid)
    expect(result).toBeDefined()
    expect(result?.favorite).toBe(true)
  })

  it('should return undefined for non-object types', () => {
    expect(charMeta['validate'](null)).toBeUndefined()
  })

  it('should apply default favorite if missing', () => {
    const partial = {}
    const result = charMeta['validate'](partial)
    expect(result).toBeDefined()
    expect(result?.favorite).toBe(false)
  })

  it('should get default value for non-existent key', () => {
    const result = charMeta.get(allCharacterKeys[0])
    expect(result).toBeDefined()
    expect(result.favorite).toBe(false)
  })
})
