import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allRelicSetKeys, relicMaxLevel } from '@genshin-optimizer/sr/consts'
import { SroDatabase } from '../Database'

describe('RelicDataManager.validate', () => {
  let database: SroDatabase
  let relics: SroDatabase['relics']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('sro')
    database = new SroDatabase(1, dbStorage)
    relics = database.relics
  })

  it('should validate valid IRelic', () => {
    const valid = {
      setKey: allRelicSetKeys[0],
      rarity: 5,
      level: 10,
      slotKey: 'head',
      mainStatKey: 'hp',
      substats: [],
      location: '',
      lock: false,
    }
    const result = relics['validate'](valid)
    expect(result).toBeDefined()
    expect(result?.setKey).toBe(allRelicSetKeys[0])
  })

  it('should return undefined for non-object types', () => {
    expect(relics['validate'](null)).toBeUndefined()
  })

  it('should return undefined for invalid setKey', () => {
    const invalid = {
      setKey: 'INVALID' as any,
      rarity: 5,
      level: 10,
      slotKey: 'head',
      mainStatKey: 'hp',
      substats: [],
      location: '',
      lock: false,
    }
    const result = relics['validate'](invalid)
    // SR validation is strict - returns undefined for invalid setKey
    expect(result).toBeUndefined()
  })

  it('should return undefined if level exceeds max for rarity', () => {
    const invalid = {
      setKey: allRelicSetKeys[0],
      rarity: 5,
      level: relicMaxLevel[5] + 1,
      slotKey: 'head',
      mainStatKey: 'hp',
      substats: [],
      location: '',
      lock: false,
    }
    const result = relics['validate'](invalid)
    // SR validation is strict - returns undefined for invalid level
    expect(result).toBeUndefined()
  })

  it('should return undefined if substat has same key as mainstat', () => {
    const invalid = {
      setKey: allRelicSetKeys[0],
      rarity: 5,
      level: 10,
      slotKey: 'head',
      mainStatKey: 'hp',
      substats: [{ key: 'hp', value: 100 }],
      location: '',
      lock: false,
    }
    expect(relics['validate'](invalid)).toBeUndefined()
  })

  it('should clear invalid location', () => {
    const invalid = {
      setKey: allRelicSetKeys[0],
      rarity: 5,
      level: 10,
      slotKey: 'head',
      mainStatKey: 'hp',
      substats: [],
      location: 'INVALID_LOCATION',
      lock: false,
    }
    const result = relics['validate'](invalid)
    expect(result).toBeDefined()
    expect(result?.location).toBe('')
  })
})
