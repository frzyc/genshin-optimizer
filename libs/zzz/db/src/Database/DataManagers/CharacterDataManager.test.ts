import { createTestDBStorage } from '@genshin-optimizer/common/database'
import {
  allCharacterKeys,
  coreLimits,
  skillLimits,
} from '@genshin-optimizer/zzz/consts'
import { ZzzDatabase } from '../Database'

describe('CharacterDataManager.validate', () => {
  let database: ZzzDatabase
  let chars: ZzzDatabase['chars']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('zzz')
    database = new ZzzDatabase(1, dbStorage)
    chars = database.chars
  })

  describe('valid inputs', () => {
    it('should validate valid ICharacter', () => {
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
      expect(result).toBeDefined()
      expect(result?.key).toBe(allCharacterKeys[0])
      expect(result?.level).toBe(50)
      expect(result?.promotion).toBe(4) // Level 50 requires promotion 4
      expect(result?.core).toBe(3)
      expect(result?.mindscape).toBe(2)
    })

    it('should validate with mindscape 0', () => {
      const valid = {
        key: allCharacterKeys[0],
        level: 1,
        promotion: 0,
        core: 0,
        mindscape: 0,
        dodge: 1,
        basic: 1,
        chain: 1,
        special: 1,
        assist: 1,
      }
      const result = chars['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.mindscape).toBe(0)
    })

    it('should validate with mindscape 6', () => {
      const valid = {
        key: allCharacterKeys[0],
        level: 60,
        promotion: 6,
        core: 6,
        mindscape: 6,
        dodge: 12,
        basic: 12,
        chain: 12,
        special: 12,
        assist: 12,
      }
      const result = chars['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.mindscape).toBe(6)
    })
  })

  describe('invalid types', () => {
    it('should return undefined for non-object types', () => {
      expect(chars['validate'](null)).toBeUndefined()
      expect(chars['validate'](undefined)).toBeUndefined()
      expect(chars['validate']('string')).toBeUndefined()
      expect(chars['validate'](123)).toBeUndefined()
      expect(chars['validate'](true)).toBeUndefined()
      expect(chars['validate']([])).toBeUndefined()
    })

    it('should return undefined for invalid character key', () => {
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
  })

  describe('default values and clamping', () => {
    it('should clamp mindscape to 0 if negative', () => {
      const invalid = {
        key: allCharacterKeys[0],
        level: 50,
        promotion: 3,
        core: 3,
        mindscape: -1,
        dodge: 5,
        basic: 5,
        chain: 5,
        special: 5,
        assist: 5,
      }
      const result = chars['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.mindscape).toBe(0)
    })

    it('should clamp mindscape to 0 if exceeds 6', () => {
      const invalid = {
        key: allCharacterKeys[0],
        level: 50,
        promotion: 3,
        core: 3,
        mindscape: 7,
        dodge: 5,
        basic: 5,
        chain: 5,
        special: 5,
        assist: 5,
      }
      const result = chars['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.mindscape).toBe(0)
    })

    it('should apply default mindscape if not a number', () => {
      const invalid = {
        key: allCharacterKeys[0],
        level: 50,
        promotion: 3,
        core: 3,
        mindscape: 'not a number',
        dodge: 5,
        basic: 5,
        chain: 5,
        special: 5,
        assist: 5,
      }
      const result = chars['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.mindscape).toBe(0)
    })

    it('should apply default basic if not a number', () => {
      const invalid = {
        key: allCharacterKeys[0],
        level: 50,
        promotion: 3,
        core: 3,
        mindscape: 2,
        dodge: 5,
        basic: 'not a number',
        chain: 5,
        special: 5,
        assist: 5,
      }
      const result = chars['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.basic).toBe(1)
    })

    it('should clamp skill levels to promotion limits', () => {
      // Level 50 requires promotion 4, not 3
      const promotion = 4
      const maxSkillLevel = skillLimits[promotion]

      const invalid = {
        key: allCharacterKeys[0],
        level: 50,
        promotion: 3, // Will be corrected to 4 by validation
        core: 3,
        mindscape: 2,
        dodge: maxSkillLevel + 5,
        basic: maxSkillLevel + 5,
        chain: maxSkillLevel + 5,
        special: maxSkillLevel + 5,
        assist: maxSkillLevel + 5,
      }
      const result = chars['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.dodge).toBe(maxSkillLevel)
      expect(result?.basic).toBe(maxSkillLevel)
      expect(result?.chain).toBe(maxSkillLevel)
      expect(result?.special).toBe(maxSkillLevel)
      expect(result?.assist).toBe(maxSkillLevel)
    })

    it('should clamp skill levels to minimum 1', () => {
      const invalid = {
        key: allCharacterKeys[0],
        level: 50,
        promotion: 3,
        core: 3,
        mindscape: 2,
        dodge: 0,
        basic: -5,
        chain: 0,
        special: -1,
        assist: 0,
      }
      const result = chars['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.dodge).toBe(1)
      expect(result?.basic).toBe(1)
      expect(result?.chain).toBe(1)
      expect(result?.special).toBe(1)
      expect(result?.assist).toBe(1)
    })

    it('should apply default core if not a number', () => {
      const invalid = {
        key: allCharacterKeys[0],
        level: 50,
        promotion: 3,
        core: 'not a number',
        mindscape: 2,
        dodge: 5,
        basic: 5,
        chain: 5,
        special: 5,
        assist: 5,
      }
      const result = chars['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.core).toBe(0)
    })

    it('should clamp core to promotion limits', () => {
      // Level 50 requires promotion 4, not 3
      const promotion = 4
      const maxCore = coreLimits[promotion]

      const invalid = {
        key: allCharacterKeys[0],
        level: 50,
        promotion: 3, // Will be corrected to 4 by validation
        core: maxCore + 5,
        mindscape: 2,
        dodge: 5,
        basic: 5,
        chain: 5,
        special: 5,
        assist: 5,
      }
      const result = chars['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.core).toBe(maxCore)
    })

    it('should clamp core to minimum 0', () => {
      const invalid = {
        key: allCharacterKeys[0],
        level: 50,
        promotion: 3,
        core: -5,
        mindscape: 2,
        dodge: 5,
        basic: 5,
        chain: 5,
        special: 5,
        assist: 5,
      }
      const result = chars['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.core).toBe(0)
    })
  })

  describe('level and promotion validation', () => {
    it('should sanitize level and promotion', () => {
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
      expect(result).toBeDefined()
      expect(typeof result?.level).toBe('number')
      expect(typeof result?.promotion).toBe('number')
    })
  })

  describe('edge cases', () => {
    it('should validate all character keys', () => {
      allCharacterKeys.forEach((key) => {
        const valid = {
          key,
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
        expect(result).toBeDefined()
        expect(result?.key).toBe(key)
      })
    })

    it('should validate at all promotion levels', () => {
      // ZZZ has promotion levels 0-5 (max level 60)
      for (let promotion = 0; promotion <= 5; promotion++) {
        const maxSkill = skillLimits[promotion]
        const maxCore = coreLimits[promotion]

        const valid = {
          key: allCharacterKeys[0],
          level: 10 * promotion + 1,
          promotion,
          core: maxCore,
          mindscape: 0,
          dodge: maxSkill,
          basic: maxSkill,
          chain: maxSkill,
          special: maxSkill,
          assist: maxSkill,
        }
        const result = chars['validate'](valid)
        expect(result).toBeDefined()
        expect(result?.promotion).toBe(promotion)
        expect(result?.core).toBe(maxCore)
        expect(result?.dodge).toBe(maxSkill)
      }
    })
  })
})
