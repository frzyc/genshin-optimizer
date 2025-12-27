import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allCharacterKeys } from '@genshin-optimizer/zzz/consts'
import { ZzzDatabase } from '../Database'
import { critModeKeys, targetQ, targetQt } from './CharacterOptManager'

describe('CharacterOptManager.validate', () => {
  let database: ZzzDatabase
  let charOpts: ReturnType<typeof database.charOpts>

  beforeEach(() => {
    const dbStorage = createTestDBStorage('zzz')
    database = new ZzzDatabase(1, dbStorage)
    charOpts = database.charOpts
  })

  describe('valid inputs', () => {
    it('should validate minimal CharOpt', () => {
      const valid = {
        conditionals: [],
        bonusStats: [],
        teammates: [],
        critMode: 'avg' as const,
        enemyLvl: 60,
        enemyDef: 0,
        enemyStunMultiplier: 1,
        enemyStats: {},
      }
      const result = charOpts['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.critMode).toBe('avg')
    })

    it('should validate with target stat', () => {
      const valid = {
        target: {
          q: 'hp' as const,
          qt: 'final' as const,
        },
        conditionals: [],
        bonusStats: [],
        teammates: [],
        critMode: 'avg' as const,
        enemyLvl: 60,
        enemyDef: 0,
        enemyStunMultiplier: 1,
        enemyStats: {},
      }
      const result = charOpts['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.target?.q).toBe('hp')
      expect(result?.target?.qt).toBe('final')
    })

    it('should validate with teammates', () => {
      const valid = {
        conditionals: [],
        bonusStats: [],
        // teammates should be an array of CharacterKey strings, not objects
        teammates: [allCharacterKeys[0], allCharacterKeys[1]],
        critMode: 'crit' as const,
        enemyLvl: 60,
        enemyDef: 0,
        enemyStunMultiplier: 1,
        enemyStats: {},
      }
      const result = charOpts['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.teammates).toHaveLength(2)
    })

    it('should validate with optConfigId', () => {
      const optConfigId = database.optConfigs.new()
      const valid = {
        conditionals: [],
        bonusStats: [],
        teammates: [],
        critMode: 'avg' as const,
        enemyLvl: 60,
        enemyDef: 0,
        enemyStunMultiplier: 1,
        enemyStats: {},
        optConfigId,
      }
      const result = charOpts['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.optConfigId).toBe(optConfigId)
    })
  })

  describe('invalid types', () => {
    it('should return undefined for non-object types', () => {
      expect(charOpts['validate'](null)).toBeUndefined()
      expect(charOpts['validate'](undefined)).toBeUndefined()
      expect(charOpts['validate']('string')).toBeUndefined()
      expect(charOpts['validate'](123)).toBeUndefined()
      expect(charOpts['validate'](true)).toBeUndefined()
      expect(charOpts['validate']([])).toBeUndefined()
    })
  })

  describe('default values', () => {
    it('should apply default conditionals if not array', () => {
      const invalid = {
        conditionals: 'not an array',
        bonusStats: [],
        teammates: [],
        critMode: 'avg' as const,
        enemyLvl: 60,
        enemyDef: 0,
        enemyStunMultiplier: 1,
        enemyStats: {},
      }
      const result = charOpts['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.conditionals).toEqual([])
    })

    it('should apply default bonusStats if not array', () => {
      const invalid = {
        conditionals: [],
        bonusStats: 'not an array',
        teammates: [],
        critMode: 'avg' as const,
        enemyLvl: 60,
        enemyDef: 0,
        enemyStunMultiplier: 1,
        enemyStats: {},
      }
      const result = charOpts['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.bonusStats).toEqual([])
    })

    it('should apply default teammates if not array', () => {
      const invalid = {
        conditionals: [],
        bonusStats: [],
        teammates: 'not an array',
        critMode: 'avg' as const,
        enemyLvl: 60,
        enemyDef: 0,
        enemyStunMultiplier: 1,
        enemyStats: {},
      }
      const result = charOpts['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.teammates).toEqual([])
    })

    it('should apply default critMode for invalid value', () => {
      const invalid = {
        conditionals: [],
        bonusStats: [],
        teammates: [],
        critMode: 'INVALID',
        enemyLvl: 60,
        enemyDef: 0,
        enemyStunMultiplier: 1,
        enemyStats: {},
      }
      const result = charOpts['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.critMode).toBe(critModeKeys[0])
    })

    it('should apply default enemyLvl if not number', () => {
      const invalid = {
        conditionals: [],
        bonusStats: [],
        teammates: [],
        critMode: 'avg' as const,
        enemyLvl: 'not a number',
        enemyDef: 0,
        enemyStunMultiplier: 1,
        enemyStats: {},
      }
      const result = charOpts['validate'](invalid)
      expect(result).toBeDefined()
      expect(typeof result?.enemyLvl).toBe('number')
    })

    it('should apply default enemyDef if not number', () => {
      const invalid = {
        conditionals: [],
        bonusStats: [],
        teammates: [],
        critMode: 'avg' as const,
        enemyLvl: 60,
        enemyDef: 'not a number',
        enemyStunMultiplier: 1,
        enemyStats: {},
      }
      const result = charOpts['validate'](invalid)
      expect(result).toBeDefined()
      expect(typeof result?.enemyDef).toBe('number')
    })

    it('should apply default enemyStunMultiplier if not number', () => {
      const invalid = {
        conditionals: [],
        bonusStats: [],
        teammates: [],
        critMode: 'avg' as const,
        enemyLvl: 60,
        enemyDef: 0,
        enemyStunMultiplier: 'not a number',
        enemyStats: {},
      }
      const result = charOpts['validate'](invalid)
      expect(result).toBeDefined()
      expect(typeof result?.enemyStunMultiplier).toBe('number')
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
      expect(result).toBeDefined()
      expect(result?.optConfigId).toBeUndefined()
    })
  })

  describe('target validation', () => {
    it('should remove invalid target stat q', () => {
      const invalid = {
        target: {
          q: 'INVALID',
          qt: 'final' as const,
        },
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
      expect(result).toBeDefined()
      expect(result?.target).toBeUndefined()
    })

    it('should remove invalid target stat qt', () => {
      const invalid = {
        target: {
          q: 'hp' as const,
          qt: 'INVALID',
        },
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
      expect(result).toBeDefined()
      expect(result?.target).toBeUndefined()
    })

    it('should validate all valid target q values', () => {
      targetQ.forEach((q) => {
        const valid = {
          target: {
            q,
            qt: 'final' as const,
          },
          conditionals: [],
          bonusStats: [],
          teammates: [],
          critMode: 'avg' as const,
          enemyLvl: 60,
          enemyDef: 0,
          enemyStunMultiplier: 1,
          enemyStats: {},
        }
        const result = charOpts['validate'](valid)
        expect(result).toBeDefined()
        expect(result?.target?.q).toBe(q)
      })
    })

    it('should validate all valid target qt values', () => {
      targetQt.forEach((qt) => {
        const valid = {
          target: {
            q: 'hp' as const,
            qt,
          },
          conditionals: [],
          bonusStats: [],
          teammates: [],
          critMode: 'avg' as const,
          enemyLvl: 60,
          enemyDef: 0,
          enemyStunMultiplier: 1,
          enemyStats: {},
        }
        const result = charOpts['validate'](valid)
        expect(result).toBeDefined()
        expect(result?.target?.qt).toBe(qt)
      })
    })
  })

  describe('teammates validation', () => {
    it('should filter teammates with invalid characterKey', () => {
      const invalid = {
        conditionals: [],
        bonusStats: [],
        // teammates should be an array of CharacterKey strings
        teammates: ['INVALID_KEY' as any, allCharacterKeys[0]],
        critMode: 'avg' as const,
        enemyLvl: 60,
        enemyDef: 0,
        enemyStunMultiplier: 1,
        enemyStats: {},
      }
      const result = charOpts['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.teammates).toHaveLength(1)
      expect(result?.teammates[0]).toBe(allCharacterKeys[0])
    })

    it('should limit teammates to 2', () => {
      const invalid = {
        conditionals: [],
        bonusStats: [],
        // teammates should be an array of CharacterKey strings
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
      expect(result).toBeDefined()
      expect(result?.teammates).toHaveLength(2)
    })
  })

  describe('edge cases', () => {
    it('should handle empty object', () => {
      const result = charOpts['validate']({})
      expect(result).toBeDefined()
      expect(result?.conditionals).toEqual([])
      expect(result?.bonusStats).toEqual([])
      expect(result?.teammates).toEqual([])
    })

    it('should validate all valid critMode values', () => {
      critModeKeys.forEach((critMode) => {
        const valid = {
          conditionals: [],
          bonusStats: [],
          teammates: [],
          critMode,
          enemyLvl: 60,
          enemyDef: 0,
          enemyStunMultiplier: 1,
          enemyStats: {},
        }
        const result = charOpts['validate'](valid)
        expect(result).toBeDefined()
        expect(result?.critMode).toBe(critMode)
      })
    })
  })
})
