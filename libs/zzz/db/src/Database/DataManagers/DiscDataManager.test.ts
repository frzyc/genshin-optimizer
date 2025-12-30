import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allDiscSetKeys } from '@genshin-optimizer/zzz/consts'
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

  it('should reject substat with same key as mainstat', () => {
    const invalid = {
      setKey: allDiscSetKeys[0],
      rarity: 'S' as const,
      level: 10,
      slotKey: '1' as const,
      mainStatKey: 'hp' as const,
      substats: [{ key: 'hp' as const, upgrades: 2 }],
      location: '',
      lock: false,
      trash: false,
    }
    expect(discs['validate'](invalid)).toBeUndefined()
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
        { key: 'atk_' as const, upgrades: 2 },
        { key: 'def_' as const, upgrades: 2 },
        { key: 'crit_' as const, upgrades: 2 },
        { key: 'crit_dmg_' as const, upgrades: 1 },
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
        { key: 'hp' as const, upgrades: 2 },
        { key: 'def_' as const, upgrades: 2 },
        { key: 'crit_' as const, upgrades: 2 },
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
      substats: [{ key: 'atk_' as const, upgrades: 2 }],
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
        { key: 'atk_' as const, upgrades: 10 },
        { key: 'def_' as const, upgrades: 10 },
        { key: 'crit_' as const, upgrades: 10 },
      ],
      location: '',
      lock: false,
      trash: false,
    }
    const result = validateDiscBasedOnRarity(invalid)
    expect(result.errors.some((e) => e.includes('no more than'))).toBe(true)
  })
})
