import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allCharacterKeys } from '@genshin-optimizer/zzz/consts'
import { ZzzDatabase } from '../Database'

describe('CharacterOptManager', () => {
  let database: ZzzDatabase
  let charOpts: ZzzDatabase['charOpts']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('zzz')
    database = new ZzzDatabase(1, dbStorage)
    charOpts = database.charOpts
  })

  it('should remove invalid target stat', () => {
    const invalid = {
      target: { q: 'INVALID', qt: 'final' as const },
      conditionals: [],
      bonusStats: [],
      teammates: [],
      critMode: 'avg' as const,
      enemyLvl: 60,
      enemyDef: 0,
      enemyStunMultiplier: 1,
      enemyStats: {},
    }
    const result = charOpts['validate'](invalid)
    expect(result?.target).toBeUndefined()
  })

  it('should filter invalid teammates', () => {
    const invalid = {
      conditionals: [],
      bonusStats: [],
      teammates: ['INVALID_KEY' as any, allCharacterKeys[0]],
      critMode: 'avg' as const,
      enemyLvl: 60,
      enemyDef: 0,
      enemyStunMultiplier: 1,
      enemyStats: {},
    }
    const result = charOpts['validate'](invalid)
    expect(result?.teammates).toHaveLength(1)
    expect(result?.teammates[0]).toBe(allCharacterKeys[0])
  })

  it('should limit teammates to 2', () => {
    const invalid = {
      conditionals: [],
      bonusStats: [],
      teammates: [
        allCharacterKeys[0],
        allCharacterKeys[1],
        allCharacterKeys[2],
      ],
      critMode: 'avg' as const,
      enemyLvl: 60,
      enemyDef: 0,
      enemyStunMultiplier: 1,
      enemyStats: {},
    }
    const result = charOpts['validate'](invalid)
    expect(result?.teammates).toHaveLength(2)
  })

  it('should remove invalid optConfigId', () => {
    const invalid = {
      conditionals: [],
      bonusStats: [],
      teammates: [],
      critMode: 'avg' as const,
      enemyLvl: 60,
      enemyDef: 0,
      enemyStunMultiplier: 1,
      enemyStats: {},
      optConfigId: 'INVALID_ID',
    }
    const result = charOpts['validate'](invalid)
    expect(result?.optConfigId).toBeUndefined()
  })
})
