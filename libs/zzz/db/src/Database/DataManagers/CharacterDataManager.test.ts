import { createTestDBStorage } from '@genshin-optimizer/common/database'
import {
  allCharacterKeys,
  coreLimits,
  skillLimits,
} from '@genshin-optimizer/zzz/consts'
import { ZzzDatabase } from '../Database'

describe('CharacterDataManager', () => {
  let database: ZzzDatabase
  let chars: ZzzDatabase['chars']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('zzz')
    database = new ZzzDatabase(1, dbStorage)
    chars = database.chars
  })

  it('should reject invalid character key', () => {
    const invalid = {
      key: 'INVALID_KEY',
      level: 50,
      promotion: 3,
      core: 3,
      mindscape: 2,
      dodge: 5,
      basic: 5,
      chain: 5,
      special: 5,
      assist: 5,
    }
    expect(chars['validate'](invalid)).toBeUndefined()
  })

  it('should validate level/promotion co-validation', () => {
    // Level 50 requires promotion 4
    const valid = {
      key: allCharacterKeys[0],
      level: 50,
      promotion: 3,
      core: 3,
      mindscape: 2,
      dodge: 5,
      basic: 5,
      chain: 5,
      special: 5,
      assist: 5,
    }
    const result = chars['validate'](valid)
    expect(result?.promotion).toBe(4)
  })

  it('should clamp mindscape to [0, 6]', () => {
    const invalid = {
      key: allCharacterKeys[0],
      level: 50,
      promotion: 4,
      core: 3,
      mindscape: 7,
      dodge: 5,
      basic: 5,
      chain: 5,
      special: 5,
      assist: 5,
    }
    const result = chars['validate'](invalid)
    expect(result?.mindscape).toBe(0) // Falls back to 0 when out of bounds
  })

  it('should clamp skill levels to promotion limits', () => {
    const promotion = 4
    const maxSkill = skillLimits[promotion]
    const invalid = {
      key: allCharacterKeys[0],
      level: 50,
      promotion: 4,
      core: 3,
      mindscape: 2,
      dodge: maxSkill + 5,
      basic: maxSkill + 5,
      chain: maxSkill + 5,
      special: maxSkill + 5,
      assist: maxSkill + 5,
    }
    const result = chars['validate'](invalid)
    expect(result?.dodge).toBe(maxSkill)
    expect(result?.basic).toBe(maxSkill)
  })

  it('should clamp core to promotion limits', () => {
    const promotion = 4
    const maxCore = coreLimits[promotion]
    const invalid = {
      key: allCharacterKeys[0],
      level: 50,
      promotion: 4,
      core: maxCore + 5,
      mindscape: 2,
      dodge: 5,
      basic: 5,
      chain: 5,
      special: 5,
      assist: 5,
    }
    const result = chars['validate'](invalid)
    expect(result?.core).toBe(maxCore)
  })
})
