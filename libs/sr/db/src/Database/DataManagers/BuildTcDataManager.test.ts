import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allCharacterKeys } from '@genshin-optimizer/sr/consts'
import { SroDatabase } from '../Database'

describe('BuildTcDataManager.validate', () => {
  let database: SroDatabase
  let buildTcs: ReturnType<typeof database.buildTcs>

  beforeEach(() => {
    const dbStorage = createTestDBStorage('sro')
    database = new SroDatabase(1, dbStorage)
    buildTcs = database.buildTcs
  })

  it('should validate valid BuildTc', () => {
    const valid = {
      characterKey: allCharacterKeys[0],
      name: 'Test BuildTc',
      description: 'Test description',
      lightCone: undefined,
      relic: {
        slots: {},
        substats: { type: 'max', stats: {}, rarity: 5 },
        sets: {},
      },
      optimization: {
        distributedSubstats: 20,
        maxSubstats: {},
      },
    }
    const result = buildTcs['validate'](valid)
    expect(result).toBeDefined()
    expect(result?.name).toBe('Test BuildTc')
  })

  it('should return undefined for non-object types', () => {
    expect(buildTcs['validate'](null)).toBeUndefined()
  })

  it('should apply default name if missing', () => {
    const partial = {
      characterKey: allCharacterKeys[0],
      description: 'Test',
      lightCone: undefined,
      relic: {
        slots: {},
        substats: { type: 'max', stats: {}, rarity: 5 },
        sets: {},
      },
      optimization: {
        distributedSubstats: 20,
        maxSubstats: {},
      },
    }
    const result = buildTcs['validate'](partial)
    expect(result).toBeDefined()
    expect(typeof result?.name).toBe('string')
  })
})
