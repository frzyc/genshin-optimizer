import { createTestDBStorage } from '@genshin-optimizer/common/database'
import {
  allAttributeKeys,
  allCharacterRarityKeys,
  allSpecialtyKeys,
} from '@genshin-optimizer/zzz/consts'
import { ZzzDatabase } from '../Database'

describe('DisplayCharacterEntry', () => {
  let database: ZzzDatabase
  let displayChar: ZzzDatabase['displayCharacter']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('zzz')
    database = new ZzzDatabase(1, dbStorage)
    displayChar = database.displayCharacter
  })

  it('should disallow "new" as sortType', () => {
    const invalid = {
      sortType: 'new',
      ascending: false,
      specialtyType: [...allSpecialtyKeys],
      attribute: [...allAttributeKeys],
      rarity: [...allCharacterRarityKeys],
    }
    const result = displayChar['validate'](invalid)
    expect(result?.sortType).toBe('level')
  })
})
