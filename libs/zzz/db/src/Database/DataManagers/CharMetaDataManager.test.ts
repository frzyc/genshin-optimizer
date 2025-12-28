import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allCharacterKeys } from '@genshin-optimizer/zzz/consts'
import { ZzzDatabase } from '../Database'

describe('CharMetaDataManager', () => {
  let database: ZzzDatabase
  let charMeta: ZzzDatabase['charMeta']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('zzz')
    database = new ZzzDatabase(1, dbStorage)
    charMeta = database.charMeta
  })

  it('should validate ICharMeta with description', () => {
    const valid = { description: 'Test description' }
    const result = charMeta['validate'](valid)
    expect(result?.description).toBe('Test description')
  })

  it('should get default value for non-existent key', () => {
    const result = charMeta.get(allCharacterKeys[0])
    expect(result.description).toBe('')
  })

  it('should set and get character meta', () => {
    const charKey = allCharacterKeys[0]
    charMeta.set(charKey, { description: 'Test meta' })
    const result = charMeta.get(charKey)
    expect(result.description).toBe('Test meta')
  })
})
