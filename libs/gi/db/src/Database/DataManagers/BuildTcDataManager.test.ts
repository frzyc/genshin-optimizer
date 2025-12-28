import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { ArtCharDatabase } from '../ArtCharDatabase'

describe('BuildTcDataManager', () => {
  let database: ArtCharDatabase
  let buildTcs: ArtCharDatabase['buildTcs']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
    buildTcs = database.buildTcs
  })

  it('should validate complete BuildTc', () => {
    const valid = {
      name: 'Test BuildTc',
      description: 'Test description',
      character: {
        level: 80,
        constellation: 0,
        ascension: 6,
        talent: { auto: 1, skill: 1, burst: 1 },
      },
      weapon: {
        key: 'DullBlade' as const,
        level: 1,
        ascension: 0,
        refinement: 1,
      },
      artifact: {
        slots: {
          flower: { level: 0, statKey: 'hp', rarity: 5 },
          plume: { level: 0, statKey: 'atk', rarity: 5 },
          sands: { level: 0, statKey: 'atk_', rarity: 5 },
          goblet: { level: 0, statKey: 'atk_', rarity: 5 },
          circlet: { level: 0, statKey: 'atk_', rarity: 5 },
        },
        substats: { type: 'max', stats: {}, rarity: 5 },
        sets: {},
      },
      optimization: {
        distributedSubstats: 0,
        maxSubstats: {},
      },
    }
    const result = buildTcs['validate'](valid)
    expect(result?.name).toBe('Test BuildTc')
  })
})
