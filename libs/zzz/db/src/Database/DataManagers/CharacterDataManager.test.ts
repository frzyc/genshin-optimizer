import { createTestDBStorage } from '@genshin-optimizer/common/database'
import {
  allCharacterKeys,
  coreByLevel,
  skillByLevel,
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

  it('should validate level/promotion co-validation', () => {
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

  it('should clamp skill levels to level-based limits', () => {
    const level = 50
    const maxSkill = skillByLevel(level)
    const invalid = {
      key: allCharacterKeys[0],
      level,
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

  it('should clamp core to level-based limits', () => {
    const level = 50
    const maxCore = coreByLevel(level)
    const invalid = {
      key: allCharacterKeys[0],
      level,
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
