import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allArtifactSetKeys, artMaxLevel } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { ArtCharDatabase } from '../ArtCharDatabase'

describe('ArtifactDataManager.validate', () => {
  let database: ArtCharDatabase
  let artifacts: ArtCharDatabase['arts']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
    artifacts = database.arts
  })

  it('should validate valid IArtifact', () => {
    // Find a valid artifact set that supports rarity 5 and flower slot
    const validSetKey = allArtifactSetKeys.find(
      (setKey) =>
        allStats.art.data[setKey].slots.includes('flower') &&
        allStats.art.data[setKey].rarities.includes(5)
    )
    expect(validSetKey).toBeDefined()
    const valid = {
      setKey: validSetKey!,
      rarity: 5,
      level: 10,
      slotKey: 'flower',
      mainStatKey: 'hp',
      substats: [],
      location: '',
      lock: false,
    }
    const result = artifacts['validate'](valid)
    expect(result).toBeDefined()
    expect(result?.setKey).toBe(validSetKey)
  })

  it('should return undefined for non-object types', () => {
    expect(artifacts['validate'](null)).toBeUndefined()
  })

  it('should return undefined for invalid setKey', () => {
    const invalid = {
      setKey: 'INVALID' as any,
      rarity: 5,
      level: 10,
      slotKey: 'flower',
      mainStatKey: 'hp',
      substats: [],
      location: '',
      lock: false,
    }
    const result = artifacts['validate'](invalid)
    // GI validation is strict - returns undefined for invalid setKey
    expect(result).toBeUndefined()
  })

  it('should return undefined if level exceeds max for rarity', () => {
    // Find a valid artifact set that supports rarity 5 and flower slot
    const validSetKey = allArtifactSetKeys.find(
      (setKey) =>
        allStats.art.data[setKey].slots.includes('flower') &&
        allStats.art.data[setKey].rarities.includes(5)
    )
    expect(validSetKey).toBeDefined()
    const invalid = {
      setKey: validSetKey!,
      rarity: 5,
      level: artMaxLevel[5] + 1,
      slotKey: 'flower',
      mainStatKey: 'hp',
      substats: [],
      location: '',
      lock: false,
    }
    const result = artifacts['validate'](invalid)
    // GI validation is strict - returns undefined for invalid level
    expect(result).toBeUndefined()
  })

  it('should return undefined if substat has same key as mainstat', () => {
    // Find a valid artifact set that supports rarity 5 and flower slot
    const validSetKey = allArtifactSetKeys.find(
      (setKey) =>
        allStats.art.data[setKey].slots.includes('flower') &&
        allStats.art.data[setKey].rarities.includes(5)
    )
    expect(validSetKey).toBeDefined()
    const invalid = {
      setKey: validSetKey!,
      rarity: 5,
      level: 10,
      slotKey: 'flower',
      mainStatKey: 'hp',
      substats: [{ key: 'hp', value: 100 }],
      location: '',
      lock: false,
    }
    expect(artifacts['validate'](invalid)).toBeUndefined()
  })
})
