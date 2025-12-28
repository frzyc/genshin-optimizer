import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allCharacterKeys } from '@genshin-optimizer/gi/consts'
import { ArtCharDatabase } from '../ArtCharDatabase'

describe('CharMetaDataManager.validate', () => {
  let database: ArtCharDatabase
  let charMetas: ArtCharDatabase['charMeta']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
    charMetas = database.charMeta
  })

  it('should validate valid ICharMeta', () => {
    const valid = {
      description: 'Test description',
      favorite: true,
      rvFilter: [],
    }
    const result = charMetas['validate'](valid)
    expect(result).toBeDefined()
    expect(result?.description).toBe('Test description')
    expect(result?.favorite).toBe(true)
  })

  it('should return undefined for non-object types', () => {
    expect(charMetas['validate'](null)).toBeUndefined()
  })

  it('should apply default description if missing', () => {
    const partial = { favorite: false, rvFilter: [] }
    const result = charMetas['validate'](partial)
    expect(result).toBeDefined()
    expect(result?.description).toBe('')
  })

  it('should get default value for non-existent key', () => {
    const result = charMetas.get(allCharacterKeys[0])
    expect(result).toBeDefined()
    expect(result.description).toBe('')
  })
})
