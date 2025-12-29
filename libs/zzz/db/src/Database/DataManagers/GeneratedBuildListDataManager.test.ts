import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { objKeyMap } from '@genshin-optimizer/common/util'
import { allDiscSlotKeys, allWengineKeys } from '@genshin-optimizer/zzz/consts'
import { ZzzDatabase } from '../Database'
import type { GeneratedBuildList } from './GeneratedBuildListDataManager'

describe('GeneratedBuildListDataManager', () => {
  let database: ZzzDatabase
  let generatedBuildList: ZzzDatabase['generatedBuildList']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('zzz')
    database = new ZzzDatabase(1, dbStorage)
    generatedBuildList = database.generatedBuildList
  })

  function createValidDiscIds() {
    return objKeyMap(allDiscSlotKeys, (slotKey) => {
      return database.discs.new({
        setKey: 'FangedMetal',
        rarity: 'S',
        level: 0,
        slotKey,
        mainStatKey: slotKey === '4' ? 'atk_' : slotKey === '5' ? 'atk_' : 'hp',
        substats: [],
        location: '',
        lock: false,
        trash: false,
      })
    })
  }

  it('should validate GeneratedBuildList with empty builds', () => {
    const valid: GeneratedBuildList = { builds: [], buildDate: 12345 }
    const result = generatedBuildList['validate'](valid)
    expect(result?.builds).toEqual([])
    expect(result?.buildDate).toBe(12345)
  })

  it('should validate builds with valid disc IDs', () => {
    const discIds = createValidDiscIds()
    const valid: GeneratedBuildList = {
      builds: [{ value: 100, discIds }],
      buildDate: 12345,
    }
    const result = generatedBuildList['validate'](valid)
    expect(result?.builds).toHaveLength(1)
    expect(result?.builds[0]?.value).toBe(100)
  })

  it('should validate builds with wengine ID', () => {
    const wengineId = database.wengines.new({
      key: allWengineKeys[0],
      level: 50,
      modification: 3,
      phase: 2,
      location: '',
      lock: false,
    })
    const discIds = createValidDiscIds()
    const valid: GeneratedBuildList = {
      builds: [{ value: 100, wengineId, discIds }],
      buildDate: 12345,
    }
    const result = generatedBuildList['validate'](valid)
    expect(result?.builds[0]?.wengineId).toBe(wengineId)
  })

  it('should remove invalid wengineId', () => {
    const discIds = createValidDiscIds()
    const invalid = {
      builds: [{ value: 100, wengineId: 'INVALID_ID', discIds }],
      buildDate: 12345,
    }
    const result = generatedBuildList['validate'](invalid)
    expect(result?.builds[0]?.wengineId).toBeUndefined()
  })

  it('should filter invalid disc IDs from discIds', () => {
    const validDiscId = database.discs.new({
      setKey: 'FangedMetal',
      rarity: 'S',
      level: 0,
      slotKey: '1',
      mainStatKey: 'hp',
      substats: [],
      location: '',
      lock: false,
      trash: false,
    })

    const discIds = {
      '1': validDiscId,
      '2': 'INVALID_ID',
      '3': 'INVALID_ID',
      '4': 'INVALID_ID',
      '5': 'INVALID_ID',
      '6': 'INVALID_ID',
    }

    const invalid = {
      builds: [{ value: 100, discIds }],
      buildDate: 12345,
    }
    const result = generatedBuildList['validate'](invalid)
    expect(result?.builds[0]?.discIds['1']).toBe(validDiscId)
    expect(result?.builds[0]?.discIds['2']).toBeUndefined()
  })

  it('should filter mixed valid and invalid builds', () => {
    const discIds = createValidDiscIds()
    const mixed = {
      builds: [
        { value: 100, discIds },
        { value: 'invalid', discIds },
        { value: 200, discIds },
      ],
      buildDate: 12345,
    }
    const result = generatedBuildList['validate'](mixed)
    expect(result?.builds).toHaveLength(2)
    expect(result?.builds[0]?.value).toBe(100)
    expect(result?.builds[1]?.value).toBe(200)
  })
})
