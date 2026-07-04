import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allCharacterKeys } from '@genshin-optimizer/zzz/consts'
import { ZzzDatabase } from '../Database'
import { isGenericDmgInstTarget, targetTag } from './TeamDataManager'

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

  it('strips damage types from ability opt targets on validate', () => {
    const team = {
      teammates: [{ characterKey: 'Trigger' as const }],
      frames: [
        {
          tag: {
            sheet: 'Trigger',
            name: 'BasicAttackHarmonizingShot_0',
            q: 'standardDmg',
            damageType1: 'basic',
            damageType2: 'aftershock',
          },
          enemyStats: [],
        },
      ],
      enemyLvl: 60,
      enemyDef: 0,
      enemyStunMultiplier: 1,
    }
    const result = teams['validate'](team, 'Trigger')
    expect(result?.frames[0]?.tag).toEqual({
      sheet: 'Trigger',
      name: 'BasicAttackHarmonizingShot_0',
      q: 'standardDmg',
    })
    expect(targetTag(result!.frames[0]!.tag!).damageType2).toBe('aftershock')
  })

  it('keeps damage types on generic inst opt targets', () => {
    const team = {
      teammates: [{ characterKey: 'Anby' as const }],
      frames: [
        {
          tag: {
            sheet: 'Anby',
            name: 'standardDmgInst',
            q: 'standardDmg',
            damageType1: 'basic',
            damageType2: 'aftershock',
          },
          enemyStats: [],
        },
      ],
      enemyLvl: 60,
      enemyDef: 0,
      enemyStunMultiplier: 1,
    }
    const result = teams['validate'](team, 'Anby')
    expect(result?.frames[0]?.tag).toEqual({
      sheet: 'Anby',
      name: 'standardDmgInst',
      q: 'standardDmg',
      damageType1: 'basic',
      damageType2: 'aftershock',
    })
    expect(isGenericDmgInstTarget(result?.frames[0]?.tag?.name)).toBe(true)
  })

  it('resolves distinct formula names for normal vs aftershock sibling abilities', () => {
    const normal = {
      sheet: 'Soldier0Anby',
      name: 'UltimateVoidstrike_0',
      q: 'standardDmg',
    }
    const aftershock = {
      sheet: 'Soldier0Anby',
      name: 'UltimateVoidstrike_aftershock0',
      q: 'standardDmg',
    }

    expect(targetTag(normal).name).toBe('UltimateVoidstrike_0')
    expect(targetTag(aftershock).name).toBe('UltimateVoidstrike_aftershock0')
    expect(targetTag(aftershock).damageType2).toBe('aftershock')
  })
})
