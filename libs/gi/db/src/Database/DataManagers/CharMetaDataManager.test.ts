import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allCharacterKeys } from '@genshin-optimizer/gi/consts'
import { ArtCharDatabase } from '../ArtCharDatabase'

describe('CharMetaDataManager', () => {
  let database: ArtCharDatabase
  let charMetas: ArtCharDatabase['charMeta']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
    charMetas = database.charMeta
  })

  it('should validate ICharMeta with description and favorite', () => {
    const valid = {
      description: 'Test description',
      favorite: true,
      rvFilter: [],
    }
    const result = charMetas['validate'](valid)
    expect(result?.description).toBe('Test description')
    expect(result?.favorite).toBe(true)
  })

  it('should get default value for non-existent key', () => {
    const result = charMetas.get(allCharacterKeys[0])
    expect(result.description).toBe('')
  })
})
