import { createTestDBStorage } from '@genshin-optimizer/common/database'
import type { WeaponKey } from '@genshin-optimizer/gi/consts'
import { ArtCharDatabase } from '../ArtCharDatabase'
import { initialWeapon } from './WeaponDataManager'

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

  it('should find the builds that use a weapon', () => {
    const sword = weapons.new(initialWeapon('FavoniusSword'))
    const otherSword = weapons.new(initialWeapon('FavoniusSword'))
    const build1 = database.builds.new({
      characterKey: 'Bennett',
      weaponId: sword,
    })
    const build2 = database.builds.new({
      characterKey: 'Xingqiu',
      weaponId: sword,
    })
    database.builds.new({ characterKey: 'Bennett', weaponId: otherSword })

    expect(database.builds.entriesWithWeapon(sword).map(([id]) => id)).toEqual([
      build1,
      build2,
    ])
    expect(database.builds.entriesWithWeapon('nonexistent')).toEqual([])
  })

  it('should replace the weapon of builds that use a removed weapon', () => {
    const sword = weapons.new(initialWeapon('FavoniusSword'))
    const buildId = database.builds.new({
      characterKey: 'Bennett',
      weaponId: sword,
    })

    weapons.remove(sword)

    // Weapon ids can be reused, so check by key rather than by id
    expect(weapons.values.some(({ key }) => key === 'FavoniusSword')).toBe(
      false
    )
    const { weaponId } = database.builds.get(buildId)!
    expect(weapons.get(weaponId!)?.key).toBe('DullBlade')
  })
})
