import { createTestDBStorage } from '@genshin-optimizer/common-database'
import { allCharacterKeys } from '@genshin-optimizer/zzz-consts'
import { ZzzDatabase } from '../Database'

describe('TeamDataManager', () => {
  let database: ZzzDatabase
  let teams: ZzzDatabase['teams']
  const mainKey = allCharacterKeys[0]

  beforeEach(() => {
    const dbStorage = createTestDBStorage('zzz')
    database = new ZzzDatabase(1, dbStorage)
    teams = database.teams
  })

  it('should remove invalid target stat in frame 0', () => {
    const invalid = {
      teammates: [{ characterKey: mainKey }],
      frames: [
        {
          tag: { q: 'INVALID', qt: 'final' as const },
          enemyStats: [],
        },
      ],
      enemyLvl: 60,
      enemyDef: 0,
      enemyStunMultiplier: 1,
    }
    const result = teams['validate'](invalid, mainKey)
    expect(result?.frames[0]?.tag).toBeUndefined()
  })

  it('should reject more than 3 teammates', () => {
    const invalid = {
      teammates: allCharacterKeys.slice(0, 4).map((characterKey) => ({
        characterKey,
      })),
      frames: [],
      enemyLvl: 60,
      enemyDef: 0,
      enemyStunMultiplier: 1,
    }
    const result = teams['validate'](invalid, mainKey)
    expect(result).toBeUndefined()
  })

  it('should remove invalid optConfigId on teammate', () => {
    const invalid = {
      teammates: [{ characterKey: mainKey, optConfigId: 'INVALID_ID' }],
      frames: [],
      enemyLvl: 60,
      enemyDef: 0,
      enemyStunMultiplier: 1,
    }
    const result = teams['validate'](invalid, mainKey)
    expect(result?.teammates[0]?.optConfigId).toBeUndefined()
  })
})
