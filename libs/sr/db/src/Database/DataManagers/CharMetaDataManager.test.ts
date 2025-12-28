import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allCharacterKeys } from '@genshin-optimizer/sr/consts'
import { SroDatabase } from '../Database'

describe('CharMetaDataManager', () => {
  let database: SroDatabase
  let charMeta: SroDatabase['charMeta']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('sro')
    database = new SroDatabase(1, dbStorage)
    charMeta = database.charMeta
  })

  it('should validate complete ICharMeta', () => {
    const valid = { favorite: true }
    const result = charMeta['validate'](valid)
    expect(result).toBeDefined()
    expect(result?.favorite).toBe(true)
  })

  it('should return default value for non-existent character', () => {
    const result = charMeta.get(allCharacterKeys[0])
    expect(result).toBeDefined()
    expect(result.favorite).toBe(false)
  })
})
