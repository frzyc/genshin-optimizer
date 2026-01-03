import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allElementKeys, allWeaponTypeKeys } from '@genshin-optimizer/gi/consts'
import { ArtCharDatabase } from '../ArtCharDatabase'

describe('DisplayCharacterEntry', () => {
  let database: ArtCharDatabase
  let displayChar: ArtCharDatabase['displayCharacter']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
    displayChar = database.displayCharacter
  })

  it('should disallow "new" as sortType', () => {
    const invalid = {
      sortType: 'new',
      ascending: false,
      weaponType: [...allWeaponTypeKeys],
      element: [...allElementKeys],
      pageIndex: 0,
    }
    const result = displayChar['validate'](invalid)
    expect(result?.sortType).toBe('level')
  })
})
