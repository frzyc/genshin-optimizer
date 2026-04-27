import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { ArtCharDatabase } from '../ArtCharDatabase'

describe('OptConfigDataManager', () => {
  let database: ArtCharDatabase
  let optConfigs: ArtCharDatabase['optConfigs']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
    optConfigs = database.optConfigs
  })

  it('should remove invalid generatedBuildListId', () => {
    const id = optConfigs.new()
    const invalid = {
      ...optConfigs.get(id),
      generatedBuildListId: 'INVALID_ID',
    }
    const result = optConfigs['validate'](invalid, id)
    expect(result?.generatedBuildListId).toBeUndefined()
  })

  it('should keep valid generatedBuildListId', () => {
    const id = optConfigs.new()
    const buildListId = database.generatedBuildList.new({
      builds: [],
      buildDate: 12345,
    })
    const valid = {
      ...optConfigs.get(id),
      generatedBuildListId: buildListId,
    }
    const result = optConfigs['validate'](valid, id)
    expect(result?.generatedBuildListId).toBe(buildListId)
  })

  it('should remove generatedBuildListId if shared with another config', () => {
    const buildListId = database.generatedBuildList.new({
      builds: [],
      buildDate: 12345,
    })

    const id1 = optConfigs.new({ generatedBuildListId: buildListId })
    const id2 = optConfigs.new()

    const conflicting = {
      ...optConfigs.get(id2),
      generatedBuildListId: buildListId,
    }
    const result = optConfigs['validate'](conflicting, id2)
    expect(result?.generatedBuildListId).toBeUndefined()
    expect(optConfigs.get(id1)?.generatedBuildListId).toBe(buildListId)
  })

  it('should filter artExclusion to only existing artifact IDs', () => {
    const id = optConfigs.new()
    const artId = database.arts.new({
      setKey: 'Adventurer',
      rarity: 3,
      level: 0,
      slotKey: 'flower',
      mainStatKey: 'hp',
      substats: [],
      location: '',
      lock: false,
    })

    const invalid = {
      ...optConfigs.get(id),
      artExclusion: [artId, 'INVALID_ID', 'ANOTHER_INVALID'],
    }
    const result = optConfigs['validate'](invalid, id)
    expect(result?.artExclusion).toEqual([artId])
  })

  it('should ensure levelLow <= levelHigh', () => {
    const id = optConfigs.new()
    const invalid = {
      ...optConfigs.get(id),
      levelLow: 15,
      levelHigh: 10,
    }
    const result = optConfigs['validate'](invalid, id)
    expect(result?.levelLow).toBeLessThanOrEqual(result?.levelHigh ?? 0)
  })

  it('should ensure upOptLevelLow <= upOptLevelHigh', () => {
    const id = optConfigs.new()
    const invalid = {
      ...optConfigs.get(id),
      upOptLevelLow: 18,
      upOptLevelHigh: 5,
    }
    const result = optConfigs['validate'](invalid, id)
    expect(result?.upOptLevelLow).toBeLessThanOrEqual(
      result?.upOptLevelHigh ?? 0
    )
  })

  it('should exclude self from excludedLocations', () => {
    database.chars.set('Amber', { key: 'Amber' })
    database.chars.set('Bennett', { key: 'Bennett' })
    const id = optConfigs.new()

    const invalid = {
      ...optConfigs.get(id),
      excludedLocations: ['Amber', id, 'Bennett'],
    }
    const result = optConfigs['validate'](invalid, id)
    expect(result?.excludedLocations).not.toContain(id)
  })
})
