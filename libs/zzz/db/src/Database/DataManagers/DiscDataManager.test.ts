import { createTestDBStorage } from '@genshin-optimizer/common/database'
import {
  allCharacterKeys,
  allDiscRarityKeys,
  allDiscSetKeys,
  allDiscSlotKeys,
  allDiscSubStatKeys,
  discMaxLevel,
  discSlotToMainStatKeys,
} from '@genshin-optimizer/zzz/consts'
import { ZzzDatabase } from '../Database'
import { validateDisc, validateDiscBasedOnRarity } from './DiscDataManager'

describe('DiscDataManager.validate', () => {
  let database: ZzzDatabase
  let discs: ReturnType<typeof database.discs>

  beforeEach(() => {
    const dbStorage = createTestDBStorage('zzz')
    database = new ZzzDatabase(1, dbStorage)
    discs = database.discs
  })

  describe('valid inputs', () => {
    it('should validate valid IDisc', () => {
      const valid = {
        setKey: allDiscSetKeys[0],
        rarity: 'S' as const,
        level: 10,
        slotKey: '1' as const,
        mainStatKey: 'hp' as const,
        substats: [],
        location: '',
        lock: false,
        trash: false,
      }
      const result = discs['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.setKey).toBe(allDiscSetKeys[0])
      expect(result?.rarity).toBe('S')
      expect(result?.level).toBe(10)
    })

    it('should validate with substats', () => {
      const valid = {
        setKey: allDiscSetKeys[0],
        rarity: 'S' as const,
        level: 10,
        slotKey: '1' as const,
        mainStatKey: 'hp' as const,
        substats: [
          { key: 'atk_', upgrades: 2 },
          { key: 'def_', upgrades: 1 },
        ],
        location: '',
        lock: false,
        trash: false,
      }
      const result = discs['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.substats).toHaveLength(2)
    })

    it('should validate with location', () => {
      const valid = {
        setKey: allDiscSetKeys[0],
        rarity: 'S' as const,
        level: 10,
        slotKey: '1' as const,
        mainStatKey: 'hp' as const,
        substats: [],
        location: allCharacterKeys[0],
        lock: true,
        trash: false,
      }
      const result = discs['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.location).toBe(allCharacterKeys[0])
      expect(result?.lock).toBe(true)
    })
  })

  describe('invalid types', () => {
    it('should return undefined for non-object types', () => {
      expect(discs['validate'](null)).toBeUndefined()
      expect(discs['validate'](undefined)).toBeUndefined()
      expect(discs['validate']('string')).toBeUndefined()
      expect(discs['validate'](123)).toBeUndefined()
      expect(discs['validate'](true)).toBeUndefined()
      expect(discs['validate']([])).toBeUndefined()
    })
  })

  describe('default values', () => {
    it('should apply default setKey for invalid value', () => {
      const invalid = {
        setKey: 'INVALID',
        rarity: 'S' as const,
        level: 10,
        slotKey: '1' as const,
        mainStatKey: 'hp' as const,
        substats: [],
        location: '',
        lock: false,
        trash: false,
      }
      const result = discs['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.setKey).toBe(allDiscSetKeys[0])
    })

    it('should apply default slotKey for invalid value', () => {
      const invalid = {
        setKey: allDiscSetKeys[0],
        rarity: 'S' as const,
        level: 10,
        slotKey: 'INVALID',
        mainStatKey: 'hp' as const,
        substats: [],
        location: '',
        lock: false,
        trash: false,
      }
      const result = discs['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.slotKey).toBe('1')
    })

    it('should apply default rarity for invalid value', () => {
      const invalid = {
        setKey: allDiscSetKeys[0],
        rarity: 'INVALID',
        level: 10,
        slotKey: '1' as const,
        mainStatKey: 'hp' as const,
        substats: [],
        location: '',
        lock: false,
        trash: false,
      }
      const result = discs['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.rarity).toBe('S')
    })

    it('should apply default level if not a number', () => {
      const invalid = {
        setKey: allDiscSetKeys[0],
        rarity: 'S' as const,
        level: 'not a number',
        slotKey: '1' as const,
        mainStatKey: 'hp' as const,
        substats: [],
        location: '',
        lock: false,
        trash: false,
      }
      const result = discs['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.level).toBe(0)
    })

    it('should round level', () => {
      const invalid = {
        setKey: allDiscSetKeys[0],
        rarity: 'S' as const,
        level: 10.7,
        slotKey: '1' as const,
        mainStatKey: 'hp' as const,
        substats: [],
        location: '',
        lock: false,
        trash: false,
      }
      const result = discs['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.level).toBe(11)
    })

    it('should reset level to 0 if exceeds max for rarity', () => {
      const invalid = {
        setKey: allDiscSetKeys[0],
        rarity: 'S' as const,
        level: discMaxLevel['S'] + 1,
        slotKey: '1' as const,
        mainStatKey: 'hp' as const,
        substats: [],
        location: '',
        lock: false,
        trash: false,
      }
      const result = discs['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.level).toBe(0)
    })

    it('should apply default mainStatKey if invalid for slot', () => {
      const invalid = {
        setKey: allDiscSetKeys[0],
        rarity: 'S' as const,
        level: 10,
        slotKey: '1' as const,
        mainStatKey: 'INVALID',
        substats: [],
        location: '',
        lock: false,
        trash: false,
      }
      const result = discs['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.mainStatKey).toBe(discSlotToMainStatKeys['1'][0])
    })

    it('should clear invalid location', () => {
      const invalid = {
        setKey: allDiscSetKeys[0],
        rarity: 'S' as const,
        level: 10,
        slotKey: '1' as const,
        mainStatKey: 'hp' as const,
        substats: [],
        location: 'INVALID_LOCATION',
        lock: false,
        trash: false,
      }
      const result = discs['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.location).toBe('')
    })

    it('should coerce lock to boolean', () => {
      const invalid = {
        setKey: allDiscSetKeys[0],
        rarity: 'S' as const,
        level: 10,
        slotKey: '1' as const,
        mainStatKey: 'hp' as const,
        substats: [],
        location: '',
        lock: 1,
        trash: false,
      }
      const result = discs['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.lock).toBe(true)
    })

    it('should coerce trash to boolean', () => {
      const invalid = {
        setKey: allDiscSetKeys[0],
        rarity: 'S' as const,
        level: 10,
        slotKey: '1' as const,
        mainStatKey: 'hp' as const,
        substats: [],
        location: '',
        lock: false,
        trash: 'yes',
      }
      const result = discs['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.trash).toBe(true)
    })
  })

  describe('substat validation', () => {
    it('should return undefined if substat has same key as mainstat', () => {
      const invalid = {
        setKey: allDiscSetKeys[0],
        rarity: 'S' as const,
        level: 10,
        slotKey: '1' as const,
        mainStatKey: 'hp' as const,
        substats: [{ key: 'hp', upgrades: 2 }],
        location: '',
        lock: false,
        trash: false,
      }
      expect(discs['validate'](invalid)).toBeUndefined()
    })

    it('should filter invalid substat keys', () => {
      const invalid = {
        setKey: allDiscSetKeys[0],
        rarity: 'S' as const,
        level: 10,
        slotKey: '1' as const,
        mainStatKey: 'hp' as const,
        substats: [
          { key: 'INVALID', upgrades: 2 },
          { key: 'atk_', upgrades: 1 },
        ],
        location: '',
        lock: false,
        trash: false,
      }
      const result = discs['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.substats).toHaveLength(1)
      expect(result?.substats[0]?.key).toBe('atk_')
    })

    it('should round substat upgrades', () => {
      const invalid = {
        setKey: allDiscSetKeys[0],
        rarity: 'S' as const,
        level: 10,
        slotKey: '1' as const,
        mainStatKey: 'hp' as const,
        substats: [{ key: 'atk_', upgrades: 2.7 }],
        location: '',
        lock: false,
        trash: false,
      }
      const result = discs['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.substats[0]?.upgrades).toBe(3)
    })

    it('should filter substats with invalid upgrades', () => {
      const invalid = {
        setKey: allDiscSetKeys[0],
        rarity: 'S' as const,
        level: 10,
        slotKey: '1' as const,
        mainStatKey: 'hp' as const,
        substats: [
          { key: 'atk_', upgrades: 'not a number' },
          { key: 'def_', upgrades: 1 },
        ],
        location: '',
        lock: false,
        trash: false,
      }
      const result = discs['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.substats).toHaveLength(1)
      expect(result?.substats[0]?.key).toBe('def_')
    })

    it('should handle empty substats array', () => {
      const valid = {
        setKey: allDiscSetKeys[0],
        rarity: 'S' as const,
        level: 10,
        slotKey: '1' as const,
        mainStatKey: 'hp' as const,
        substats: [],
        location: '',
        lock: false,
        trash: false,
      }
      const result = discs['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.substats).toEqual([])
    })
  })

  describe('edge cases', () => {
    it('should validate all disc set keys', () => {
      allDiscSetKeys.forEach((setKey) => {
        const valid = {
          setKey,
          rarity: 'S' as const,
          level: 10,
          slotKey: '1' as const,
          mainStatKey: 'hp' as const,
          substats: [],
          location: '',
          lock: false,
          trash: false,
        }
        const result = discs['validate'](valid)
        expect(result).toBeDefined()
        expect(result?.setKey).toBe(setKey)
      })
    })

    it('should validate all disc slot keys', () => {
      allDiscSlotKeys.forEach((slotKey) => {
        const mainStatKey = discSlotToMainStatKeys[slotKey][0]
        const valid = {
          setKey: allDiscSetKeys[0],
          rarity: 'S' as const,
          level: 10,
          slotKey,
          mainStatKey,
          substats: [],
          location: '',
          lock: false,
          trash: false,
        }
        const result = discs['validate'](valid)
        expect(result).toBeDefined()
        expect(result?.slotKey).toBe(slotKey)
      })
    })

    it('should validate all disc rarity keys', () => {
      allDiscRarityKeys.forEach((rarity) => {
        const valid = {
          setKey: allDiscSetKeys[0],
          rarity,
          level: 10,
          slotKey: '1' as const,
          mainStatKey: 'hp' as const,
          substats: [],
          location: '',
          lock: false,
          trash: false,
        }
        const result = discs['validate'](valid)
        expect(result).toBeDefined()
        expect(result?.rarity).toBe(rarity)
      })
    })
  })
})

describe('validateDisc standalone function', () => {
  it('should validate valid disc', () => {
    const valid = {
      setKey: allDiscSetKeys[0],
      rarity: 'S' as const,
      level: 10,
      slotKey: '1' as const,
      mainStatKey: 'hp' as const,
      substats: [],
      location: '',
      lock: false,
      trash: false,
    }
    const result = validateDisc(valid)
    expect(result).toBeDefined()
  })

  it('should handle allowZeroSub parameter', () => {
    const valid = {
      setKey: allDiscSetKeys[0],
      rarity: 'S' as const,
      level: 10,
      slotKey: '1' as const,
      mainStatKey: 'hp' as const,
      substats: [{ key: 'atk_', upgrades: 0 }],
      location: '',
      lock: false,
      trash: false,
    }
    const result = validateDisc(valid, true)
    expect(result).toBeDefined()
  })

  it('should handle sortSubs parameter', () => {
    const valid = {
      setKey: allDiscSetKeys[0],
      rarity: 'S' as const,
      level: 10,
      slotKey: '1' as const,
      mainStatKey: 'hp' as const,
      substats: [
        { key: 'def_', upgrades: 1 },
        { key: 'atk_', upgrades: 2 },
      ],
      location: '',
      lock: false,
      trash: false,
    }
    const result = validateDisc(valid, false, false)
    expect(result).toBeDefined()
    expect(result?.substats).toHaveLength(2)
  })

  it('should return undefined for null', () => {
    expect(validateDisc(null)).toBeUndefined()
  })

  it('should return undefined for undefined', () => {
    expect(validateDisc(undefined)).toBeUndefined()
  })
})

describe('validateDiscBasedOnRarity', () => {
  it('should validate disc with correct substats', () => {
    const valid = {
      setKey: allDiscSetKeys[0],
      rarity: 'S' as const,
      level: 12,
      slotKey: '1' as const,
      mainStatKey: 'hp' as const,
      // S-rank level 12 needs 7-8 upgrades (low=3, high=4, +floor(12/3)=4)
      // Need 4 substats (all unlocked) to avoid error when upgrades > 1
      substats: [
        { key: 'atk_', upgrades: 2 },
        { key: 'def_', upgrades: 2 },
        { key: 'crit_', upgrades: 2 },
        { key: 'crit_dmg_', upgrades: 1 },
      ],
      location: '',
      lock: false,
      trash: false,
    }
    const result = validateDiscBasedOnRarity(valid)
    expect(result.validatedDisc).toBeDefined()
    expect(result.errors).toHaveLength(0)
  })

  it('should return error if substat matches mainstat', () => {
    const invalid = {
      setKey: allDiscSetKeys[0],
      rarity: 'S' as const,
      level: 12,
      slotKey: '1' as const,
      mainStatKey: 'hp' as const,
      substats: [
        { key: 'hp', upgrades: 2 },
        { key: 'def_', upgrades: 2 },
        { key: 'crit_', upgrades: 2 },
      ],
      location: '',
      lock: false,
      trash: false,
    }
    const result = validateDiscBasedOnRarity(invalid)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0]).toContain('same as mainstat')
  })

  it('should return error if too few substats', () => {
    const invalid = {
      setKey: allDiscSetKeys[0],
      rarity: 'S' as const,
      level: 12,
      slotKey: '1' as const,
      mainStatKey: 'hp' as const,
      substats: [{ key: 'atk_', upgrades: 2 }],
      location: '',
      lock: false,
      trash: false,
    }
    const result = validateDiscBasedOnRarity(invalid)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0]).toContain('should have at least')
  })

  it('should return error if upgrades exceed limit', () => {
    const invalid = {
      setKey: allDiscSetKeys[0],
      rarity: 'S' as const,
      level: 0,
      slotKey: '1' as const,
      mainStatKey: 'hp' as const,
      substats: [
        { key: 'atk_', upgrades: 10 },
        { key: 'def_', upgrades: 10 },
        { key: 'crit_', upgrades: 10 },
      ],
      location: '',
      lock: false,
      trash: false,
    }
    const result = validateDiscBasedOnRarity(invalid)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors.some((e) => e.includes('no more than'))).toBe(true)
  })

  it('should return error if substat has >1 upgrade but not all unlocked', () => {
    const invalid = {
      setKey: allDiscSetKeys[0],
      rarity: 'S' as const,
      level: 12,
      slotKey: '1' as const,
      mainStatKey: 'hp' as const,
      substats: [
        { key: 'atk_', upgrades: 3 },
        { key: 'def_', upgrades: 2 },
        { key: 'crit_', upgrades: 2 },
      ],
      location: '',
      lock: false,
      trash: false,
    }
    const result = validateDiscBasedOnRarity(invalid)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors.some((e) => e.includes('> 1 upgrade'))).toBe(true)
  })
})
