import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allWeaponTypeKeys } from '@genshin-optimizer/gi/consts'
import { ArtCharDatabase } from '../ArtCharDatabase'

describe('DisplayWeaponEntry', () => {
  let database: ArtCharDatabase
  let displayWeapon: ArtCharDatabase['displayWeapon']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
    displayWeapon = database.displayWeapon
  })

  it('should validate complete DisplayWeapon', () => {
    const valid = {
      sortType: 'level' as const,
      ascending: false,
      weaponType: [...allWeaponTypeKeys],
      rarity: [5, 4, 3, 2, 1],
    }
    const result = displayWeapon['validate'](valid)
    expect(result?.sortType).toBe('level')
  })

  it('should filter invalid weaponType values', () => {
    const invalid = {
      sortType: 'level' as const,
      ascending: false,
      weaponType: ['INVALID', allWeaponTypeKeys[0]],
      rarity: [5, 4, 3, 2, 1],
    }
    const result = displayWeapon['validate'](invalid)
    expect(result?.weaponType).toEqual([allWeaponTypeKeys[0]])
  })
})
