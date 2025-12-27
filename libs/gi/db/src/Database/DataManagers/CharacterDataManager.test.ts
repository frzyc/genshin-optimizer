import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allCharacterKeys, talentLimits } from '@genshin-optimizer/gi/consts'
import { ArtCharDatabase } from '../ArtCharDatabase'

describe('CharacterDataManager.validate', () => {
  let database: ArtCharDatabase
  let chars: ReturnType<typeof database.chars>

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
    chars = database.chars
  })

  it('should validate valid ICharacter', () => {
    const valid = {
      key: allCharacterKeys[0],
      level: 50,
      constellation: 2,
      ascension: 3,
      talent: { auto: 5, skill: 5, burst: 5 },
    }
    const result = chars['validate'](valid)
    expect(result).toBeDefined()
    expect(result?.key).toBe(allCharacterKeys[0])
  })

  it('should return undefined for invalid character key', () => {
    const invalid = {
      key: 'INVALID_KEY',
      level: 50,
      constellation: 2,
      ascension: 3,
      talent: { auto: 5, skill: 5, burst: 5 },
    }
    expect(chars['validate'](invalid)).toBeUndefined()
  })

  it('should clamp constellation to valid range', () => {
    const invalid = {
      key: allCharacterKeys[0],
      level: 50,
      constellation: 10,
      ascension: 3,
      talent: { auto: 5, skill: 5, burst: 5 },
    }
    const result = chars['validate'](invalid)
    expect(result).toBeDefined()
    expect(result?.constellation).toBe(6)
  })

  it('should clamp talent levels to max', () => {
    const invalid = {
      key: allCharacterKeys[0],
      level: 50,
      constellation: 2,
      ascension: 3,
      talent: { auto: 100, skill: 100, burst: 100 },
    }
    const result = chars['validate'](invalid)
    expect(result).toBeDefined()
    const maxTalentForAscension = talentLimits[3] // ascension 3
    expect(result?.talent.auto).toBe(maxTalentForAscension)
    expect(result?.talent.skill).toBe(maxTalentForAscension)
    expect(result?.talent.burst).toBe(maxTalentForAscension)
  })
})
