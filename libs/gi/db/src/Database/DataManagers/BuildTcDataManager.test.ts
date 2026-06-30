import { createTestDBStorage } from '@genshin-optimizer/common-database'
import {
  defaultCharacterAscension,
  defaultCharacterLevel,
  defaultTalentLevel,
  defaultWeaponAscension,
  defaultWeaponLevel,
  weaponMaxAscension,
  weaponMaxLevel,
} from '@genshin-optimizer/gi-consts'
import { allStats } from '@genshin-optimizer/gi-stats'
import { ArtCharDatabase } from '../ArtCharDatabase'
import { initCharTC } from './BuildTcDataManager'

describe('BuildTcDataManager', () => {
  let database: ArtCharDatabase
  let buildTcs: ArtCharDatabase['buildTcs']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
    buildTcs = database.buildTcs
  })

  it('should clamp Build(TC) weapon level/ascension by rarity', () => {
    const base = initCharTC('DullBlade')
    const result = buildTcs['validate']({
      ...base,
      weapon: {
        ...base.weapon,
        level: defaultWeaponLevel,
        ascension: defaultWeaponAscension,
      },
    })

    const rarity = allStats.weapon.data.DullBlade.rarity
    expect(result?.weapon.level).toBe(weaponMaxLevel[rarity])
    expect(result?.weapon.ascension).toBe(weaponMaxAscension[rarity])
  })

  it('should default Build(TC) character to optimizer-friendly values', () => {
    const base = initCharTC('DullBlade')
    const result = buildTcs['validate']({
      ...base,
      character: {},
    })

    expect(result?.character?.level).toBe(defaultCharacterLevel)
    expect(result?.character?.ascension).toBe(defaultCharacterAscension)
    expect(result?.character?.talent).toEqual({
      auto: defaultTalentLevel,
      skill: defaultTalentLevel,
      burst: defaultTalentLevel,
    })
  })
})
