import { createTestDBStorage } from '@genshin-optimizer/common-database'
import type { WeaponKey } from '@genshin-optimizer/gi-consts'
import { ArtCharDatabase } from '../ArtCharDatabase'

describe('WeaponDataManager', () => {
  let database: ArtCharDatabase
  let weapons: ArtCharDatabase['weapons']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
    weapons = database.weapons
  })

  it('should clamp 1★ weapons to 70/4 and keep 5★ at 90/6', () => {
    const weaponInput = (key: WeaponKey) => ({
      key,
      level: 90,
      ascension: 6 as const,
      refinement: 1 as const,
      location: '',
      lock: false,
    })

    expect(weapons['validate'](weaponInput('DullBlade'))).toMatchObject({
      level: 70,
      ascension: 4,
    })
    expect(weapons['validate'](weaponInput('Deathmatch'))).toMatchObject({
      level: 90,
      ascension: 6,
    })
  })
})
