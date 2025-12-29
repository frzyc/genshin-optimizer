import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allCharacterKeys } from '@genshin-optimizer/sr/consts'
import { SroDatabase } from '../Database'

// SR max values for business logic testing
const eidolonMaxLevel = 6
const skillMaxLevel = { basic: 6, skill: 10, ult: 10, talent: 10 }

describe('CharacterDataManager.validate', () => {
  let database: SroDatabase
  let chars: SroDatabase['chars']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('sro')
    database = new SroDatabase(1, dbStorage)
    chars = database.chars
  })

  it('should reject invalid character key', () => {
    const invalid = {
      key: 'INVALID_KEY',
      level: 50,
      eidolon: 2,
      ascension: 3,
      basic: 5,
      skill: 5,
      ult: 5,
      talent: 5,
      bonusAbilities: {},
    }
    expect(chars['validate'](invalid)).toBeUndefined()
  })

  it('should clamp eidolon to max 6', () => {
    const invalid = {
      key: allCharacterKeys[0],
      level: 50,
      eidolon: 10,
      ascension: 3,
      basic: 5,
      skill: 5,
      ult: 5,
      talent: 5,
      bonusAbilities: {},
    }
    const result = chars['validate'](invalid)
    expect(result).toBeDefined()
    expect(result?.eidolon).toBe(eidolonMaxLevel)
  })

  it('should clamp skill levels to their max values', () => {
    const invalid = {
      key: allCharacterKeys[0],
      level: 50,
      eidolon: 2,
      ascension: 3,
      basic: 100,
      skill: 100,
      ult: 100,
      talent: 100,
      bonusAbilities: {},
    }
    const result = chars['validate'](invalid)
    expect(result).toBeDefined()
    expect(result?.basic).toBe(skillMaxLevel.basic)
    expect(result?.skill).toBe(skillMaxLevel.skill)
    expect(result?.ult).toBe(skillMaxLevel.ult)
    expect(result?.talent).toBe(skillMaxLevel.talent)
  })

  it('should clamp skill levels to minimum 1', () => {
    const invalid = {
      key: allCharacterKeys[0],
      level: 50,
      eidolon: 2,
      ascension: 3,
      basic: 0,
      skill: -5,
      ult: 0,
      talent: -1,
      bonusAbilities: {},
    }
    const result = chars['validate'](invalid)
    expect(result).toBeDefined()
    expect(result?.basic).toBe(1)
    expect(result?.skill).toBe(1)
    expect(result?.ult).toBe(1)
    expect(result?.talent).toBe(1)
  })
})
