import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allCharacterKeys } from '@genshin-optimizer/sr/consts'
import { SroDatabase } from '../Database'

describe('CharacterOptManager.validate', () => {
  let database: SroDatabase
  let charOpts: SroDatabase['charOpts']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('sro')
    database = new SroDatabase(1, dbStorage)
    charOpts = database.charOpts
  })

  it('should remove invalid optConfigId', () => {
    const invalid = {
      target: { sheet: 'char' as const, name: 'atk' },
      conditionals: [],
      bonusStats: [],
      statConstraints: [],
      optConfigId: 'INVALID_ID',
    }
    const result = charOpts['validate'](invalid, allCharacterKeys[0])
    expect(result).toBeDefined()
    expect(result?.optConfigId).toBeUndefined()
  })
})
