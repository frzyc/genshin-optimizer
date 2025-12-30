import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { objKeyMap } from '@genshin-optimizer/common/util'
import { allDiscSlotKeys } from '@genshin-optimizer/zzz/consts'
import { ZzzDatabase } from '../Database'

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
})
