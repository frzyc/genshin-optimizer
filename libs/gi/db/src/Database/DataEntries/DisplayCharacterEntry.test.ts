import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allElementKeys, allWeaponTypeKeys } from '@genshin-optimizer/gi/consts'
import { ArtCharDatabase } from '../ArtCharDatabase'

describe('DisplayCharacterEntry.validate', () => {
  let database: ArtCharDatabase
  let displayChar: ArtCharDatabase['displayCharacter']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
    displayChar = database.displayCharacter
  })

  it('should validate valid DisplayCharacterEntry', () => {
    const valid = {
      sortType: 'level' as const,
      ascending: false,
      weaponType: [...allWeaponTypeKeys],
      element: [...allElementKeys],
      pageIndex: 0,
    }
    const result = displayChar['validate'](valid)
    expect(result).toBeDefined()
    expect(result?.sortType).toBe('level')
  })

  it('should return undefined for non-object types', () => {
    expect(displayChar['validate'](null)).toBeUndefined()
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
    expect(result).toBeDefined()
    expect(result?.sortType).toBe('level')
  })

  it('should filter invalid weaponType values', () => {
    const invalid = {
      sortType: 'level' as const,
      ascending: false,
      weaponType: [allWeaponTypeKeys[0], 'INVALID'],
      element: [...allElementKeys],
      pageIndex: 0,
    }
    const result = displayChar['validate'](invalid)
    expect(result).toBeDefined()
    expect(result?.weaponType).toEqual([allWeaponTypeKeys[0]])
  })
})
