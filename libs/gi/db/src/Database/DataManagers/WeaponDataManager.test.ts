import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allWeaponKeys, weaponMaxLevel } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { ArtCharDatabase } from '../ArtCharDatabase'

describe('WeaponDataManager.validate', () => {
  let database: ArtCharDatabase
  let weapons: ReturnType<typeof database.weapons>

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
    weapons = database.weapons
  })

  it('should validate valid IWeapon', () => {
    const valid = {
      key: allWeaponKeys[0],
      level: 50,
      ascension: 3,
      refinement: 1,
      location: '',
      lock: false,
    }
    const result = weapons['validate'](valid)
    expect(result).toBeDefined()
    expect(result?.key).toBe(allWeaponKeys[0])
  })

  it('should return undefined for invalid key', () => {
    const invalid = {
      key: 'INVALID_KEY',
      level: 50,
      ascension: 3,
      refinement: 1,
      location: '',
      lock: false,
    }
    expect(weapons['validate'](invalid)).toBeUndefined()
  })

  it('should return undefined for level exceeding max', () => {
    const weaponKey = allWeaponKeys[0]
    const { rarity } = allStats.weapon.data[weaponKey]
    const maxLevel = weaponMaxLevel[rarity]
    const invalid = {
      key: weaponKey,
      level: maxLevel + 1,
      ascension: 3,
      refinement: 1,
      location: '',
      lock: false,
    }
    expect(weapons['validate'](invalid)).toBeUndefined()
  })

  it('should reset refinement to 1 for invalid value', () => {
    const invalid = {
      key: allWeaponKeys[0],
      level: 50,
      ascension: 3,
      refinement: 10,
      location: '',
      lock: false,
    }
    const result = weapons['validate'](invalid)
    expect(result).toBeDefined()
    expect(result?.refinement).toBe(1)
  })
})
