import { createTestDBStorage } from '@genshin-optimizer/common/database'
import {
  allDiscSetKeys,
  discMaxLevel,
  discSlotToMainStatKeys,
} from '@genshin-optimizer/zzz/consts'
import { ZzzDatabase } from '../Database'
import { validateDiscBasedOnRarity } from './DiscDataManager'

describe('DiscDataManager', () => {
  let database: ZzzDatabase
  let discs: ZzzDatabase['discs']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('zzz')
    database = new ZzzDatabase(1, dbStorage)
    discs = database.discs
  })

  it('should reject level exceeding max for rarity', () => {
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
    expect(result?.level).toBe(0) // Falls back to 0
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
    expect(result?.location).toBe('')
  })

  it('should reject substat with same key as mainstat', () => {
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
    expect(result?.substats).toHaveLength(1)
    expect(result?.substats[0]?.key).toBe('atk_')
  })
})

describe('validateDiscBasedOnRarity (business logic)', () => {
  it('should validate disc with correct substats', () => {
    const valid = {
      setKey: allDiscSetKeys[0],
      rarity: 'S' as const,
      level: 12,
      slotKey: '1' as const,
      mainStatKey: 'hp' as const,
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
    expect(result.errors.some((e) => e.includes('same as mainstat'))).toBe(true)
  })

  it('should return error if too few substats for level', () => {
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
    expect(result.errors.some((e) => e.includes('should have at least'))).toBe(
      true
    )
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
    expect(result.errors.some((e) => e.includes('no more than'))).toBe(true)
  })
})
