import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allWeaponKeys, weaponMaxLevel } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { ArtCharDatabase } from '../ArtCharDatabase'

describe('WeaponDataManager', () => {
  let database: ArtCharDatabase
  let weapons: ArtCharDatabase['weapons']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
    weapons = database.weapons
  })

  it('should reject level exceeding rarity max', () => {
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
})
