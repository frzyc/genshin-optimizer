import { createTestDBStorage } from '@genshin-optimizer/common/database'
import {
  allElementalTypeKeys,
  allPathKeys,
  allRarityKeys,
} from '@genshin-optimizer/sr/consts'
import { SroDatabase } from '../Database'

describe('DisplayCharacterEntry.validate', () => {
  let database: SroDatabase
  let displayChar: SroDatabase['displayCharacter']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('sro')
    database = new SroDatabase(1, dbStorage)
    displayChar = database.displayCharacter
  })

  it('should disallow "new" as sortType', () => {
    const invalid = {
      sortType: 'new',
      ascending: false,
      path: [...allPathKeys],
      elementalType: [...allElementalTypeKeys],
      rarity: [...allRarityKeys],
    }
    const result = displayChar['validate'](invalid)
    expect(result).toBeDefined()
    expect(result?.sortType).toBe('level')
  })
})
