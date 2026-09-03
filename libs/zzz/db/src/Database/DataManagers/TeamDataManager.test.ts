import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allCharacterKeys } from '@genshin-optimizer/zzz/consts'
import { isGenericDmgInstName, toTag } from '@genshin-optimizer/zzz/formula'
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
          ref: { sheet: 'stat', name: 'INVALID', dim: 'final' },
          enemyStats: [],
        },
      ],
      enemyLvl: 60,
      enemyDef: 0,
      enemyStunMultiplier: 1,
    }
    const result = teams['validate'](invalid, mainKey)
    expect(result?.frames[0]?.ref).toBeUndefined()
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

  it('strips damage types from ability opt targets on validate', () => {
    const team = {
      teammates: [{ characterKey: 'Anby' as const }],
      frames: [
        {
          ref: {
            sheet: 'Anby',
            name: 'BasicAttackTurboVolt_0',
            dim: 'standardDmg',
            damageType1: 'basic' as const,
            damageType2: 'aftershock' as const,
          },
          enemyStats: [],
        },
      ],
      enemyLvl: 60,
      enemyDef: 0,
      enemyStunMultiplier: 1,
    }
    const result = teams['validate'](team, 'Anby')
    expect(result?.frames[0]?.ref).toEqual({
      sheet: 'Anby',
      name: 'BasicAttackTurboVolt_0',
      dim: 'standardDmg',
    })
    expect(toTag(result!.frames[0]!.ref!)!.damageType1).toBe('basic')
  })

  it('keeps damage types on generic inst opt targets', () => {
    const team = {
      teammates: [{ characterKey: 'Anby' as const }],
      frames: [
        {
          ref: {
            sheet: 'Anby',
            name: 'standardDmgInst',
            dim: 'standardDmg',
            damageType1: 'basic' as const,
            damageType2: 'aftershock' as const,
          },
          enemyStats: [],
        },
      ],
      enemyLvl: 60,
      enemyDef: 0,
      enemyStunMultiplier: 1,
    }
    const result = teams['validate'](team, 'Anby')
    expect(result?.frames[0]?.ref).toEqual({
      sheet: 'Anby',
      name: 'standardDmgInst',
      dim: 'standardDmg',
      damageType1: 'basic',
      damageType2: 'aftershock',
    })
    expect(isGenericDmgInstName(result?.frames[0]?.ref?.name)).toBe(true)
  })

  it('clears unknown named formulas', () => {
    const team = {
      teammates: [{ characterKey: 'Anby' as const }],
      frames: [
        {
          ref: {
            sheet: 'Anby',
            name: 'NotARealFormula_0',
            dim: 'standardDmg',
          },
          enemyStats: [],
        },
      ],
      enemyLvl: 60,
      enemyDef: 0,
      enemyStunMultiplier: 1,
    }
    const result = teams['validate'](team, 'Anby')
    expect(result?.frames[0]?.ref).toBeUndefined()
  })

  it('clears missing dim on a known name', () => {
    const team = {
      teammates: [{ characterKey: 'Anby' as const }],
      frames: [
        {
          ref: {
            sheet: 'Anby',
            name: 'BasicAttackTurboVolt_0',
            dim: 'sheerDmg',
          },
          enemyStats: [],
        },
      ],
      enemyLvl: 60,
      enemyDef: 0,
      enemyStunMultiplier: 1,
    }
    const result = teams['validate'](team, 'Anby')
    expect(result?.frames[0]?.ref).toBeUndefined()
  })

  it('setFrame0 rejects invalid opt targets', () => {
    teams.set(mainKey, {
      teammates: [{ characterKey: mainKey }],
      frames: [
        {
          ref: { sheet: 'stat', name: 'atk', dim: 'final' },
          enemyStats: [],
        },
      ],
      enemyLvl: 60,
      enemyDef: 0,
      enemyStunMultiplier: 1,
    })
    teams.setFrame0(mainKey, {
      ref: { sheet: 'stat', name: 'INVALID', dim: 'final' },
    })
    expect(teams.get(mainKey)?.frames[0]?.ref).toEqual({
      sheet: 'stat',
      name: 'atk',
      dim: 'final',
    })
  })
})
