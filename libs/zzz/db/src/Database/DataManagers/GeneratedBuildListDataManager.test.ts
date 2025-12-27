import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { objKeyMap } from '@genshin-optimizer/common/util'
import { allDiscSlotKeys, allWengineKeys } from '@genshin-optimizer/zzz/consts'
import { ZzzDatabase } from '../Database'
import type { GeneratedBuild, GeneratedBuildList } from './GeneratedBuildListDataManager'

describe('GeneratedBuildListDataManager.validate', () => {
  let database: ZzzDatabase
  let generatedBuildList: ReturnType<typeof database.generatedBuildList>

  beforeEach(() => {
    const dbStorage = createTestDBStorage('zzz')
    database = new ZzzDatabase(1, dbStorage)
    generatedBuildList = database.generatedBuildList
  })

  describe('valid inputs', () => {
    it('should validate valid GeneratedBuildList with empty builds', () => {
      const valid: GeneratedBuildList = {
        builds: [],
        buildDate: 12345,
      }
      const result = generatedBuildList['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.builds).toEqual([])
      expect(result?.buildDate).toBe(12345)
    })

    it('should validate with builds containing valid disc IDs', () => {
      // Create some discs first
      const discIds = objKeyMap(allDiscSlotKeys, (slotKey) => {
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

      const valid: GeneratedBuildList = {
        builds: [
          {
            value: 100,
            discIds,
          },
        ],
        buildDate: 12345,
      }
      const result = generatedBuildList['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.builds).toHaveLength(1)
      expect(result?.builds[0]?.value).toBe(100)
      expect(result?.builds[0]?.discIds).toEqual(discIds)
    })

    it('should validate with builds containing wengine ID', () => {
      const wengineId = database.wengines.new({
        key: allWengineKeys[0],
        level: 50,
        modification: 3,
        phase: 2,
        location: '',
        lock: false,
      })

      const discIds = objKeyMap(allDiscSlotKeys, (slotKey) => {
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

      const valid: GeneratedBuildList = {
        builds: [
          {
            value: 100,
            wengineId,
            discIds,
          },
        ],
        buildDate: 12345,
      }
      const result = generatedBuildList['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.builds).toHaveLength(1)
      expect(result?.builds[0]?.wengineId).toBe(wengineId)
    })
  })

  describe('invalid types', () => {
    it('should return undefined for non-object types', () => {
      expect(generatedBuildList['validate'](null)).toBeUndefined()
      expect(generatedBuildList['validate'](undefined)).toBeUndefined()
      expect(generatedBuildList['validate']('string')).toBeUndefined()
      expect(generatedBuildList['validate'](123)).toBeUndefined()
      expect(generatedBuildList['validate'](true)).toBeUndefined()
      expect(generatedBuildList['validate']([])).toBeUndefined()
    })
  })

  describe('default values', () => {
    it('should apply default builds and buildDate if builds is not an array', () => {
      const invalid = {
        builds: 'not an array',
        buildDate: 12345,
      }
      const result = generatedBuildList['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.builds).toEqual([])
      expect(result?.buildDate).toBe(0)
    })

    it('should apply default buildDate if not an integer', () => {
      const invalid = {
        builds: [],
        buildDate: 'not a number',
      }
      const result = generatedBuildList['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.buildDate).toBe(0)
    })

    it('should apply default buildDate if float', () => {
      const invalid = {
        builds: [],
        buildDate: 12345.67,
      }
      const result = generatedBuildList['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.buildDate).toBe(0)
    })
  })

  describe('build validation', () => {
    it('should filter out builds with invalid value', () => {
      const discIds = objKeyMap(allDiscSlotKeys, (slotKey) => {
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

      const invalid = {
        builds: [
          {
            value: 'not a number',
            discIds,
          },
        ],
        buildDate: 12345,
      }
      const result = generatedBuildList['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.builds).toEqual([])
    })

    it('should filter out builds with invalid discIds', () => {
      const invalid = {
        builds: [
          {
            value: 100,
            discIds: 'not an object',
          },
        ],
        buildDate: 12345,
      }
      const result = generatedBuildList['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.builds).toEqual([])
    })

    it('should filter out builds with null discIds', () => {
      const invalid = {
        builds: [
          {
            value: 100,
            discIds: null,
          },
        ],
        buildDate: 12345,
      }
      const result = generatedBuildList['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.builds).toEqual([])
    })

    it('should remove invalid wengineId', () => {
      const discIds = objKeyMap(allDiscSlotKeys, (slotKey) => {
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

      const invalid = {
        builds: [
          {
            value: 100,
            wengineId: 'INVALID_ID',
            discIds,
          },
        ],
        buildDate: 12345,
      }
      const result = generatedBuildList['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.builds).toHaveLength(1)
      expect(result?.builds[0]?.wengineId).toBeUndefined()
    })

    it('should filter out invalid disc IDs from discIds', () => {
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
        builds: [
          {
            value: 100,
            discIds,
          },
        ],
        buildDate: 12345,
      }
      const result = generatedBuildList['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.builds).toHaveLength(1)
      expect(result?.builds[0]?.discIds['1']).toBe(validDiscId)
      expect(result?.builds[0]?.discIds['2']).toBeUndefined()
    })

    it('should filter out non-object builds', () => {
      const invalid = {
        builds: ['not an object', 123, null],
        buildDate: 12345,
      }
      const result = generatedBuildList['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.builds).toEqual([])
    })
  })

  describe('edge cases', () => {
    it('should handle empty object', () => {
      const result = generatedBuildList['validate']({})
      expect(result).toBeDefined()
      expect(result?.builds).toEqual([])
      expect(result?.buildDate).toBe(0)
    })

    it('should handle multiple valid builds', () => {
      const discIds1 = objKeyMap(allDiscSlotKeys, (slotKey) => {
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

      const discIds2 = objKeyMap(allDiscSlotKeys, (slotKey) => {
        return database.discs.new({
          setKey: 'WoodpeckerElectro',
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

      const valid: GeneratedBuildList = {
        builds: [
          { value: 100, discIds: discIds1 },
          { value: 200, discIds: discIds2 },
        ],
        buildDate: 12345,
      }
      const result = generatedBuildList['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.builds).toHaveLength(2)
      expect(result?.builds[0]?.value).toBe(100)
      expect(result?.builds[1]?.value).toBe(200)
    })

    it('should handle mixed valid and invalid builds', () => {
      const discIds = objKeyMap(allDiscSlotKeys, (slotKey) => {
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

      const mixed = {
        builds: [
          { value: 100, discIds },
          { value: 'invalid', discIds },
          { value: 200, discIds },
        ],
        buildDate: 12345,
      }
      const result = generatedBuildList['validate'](mixed)
      expect(result).toBeDefined()
      expect(result?.builds).toHaveLength(2)
      expect(result?.builds[0]?.value).toBe(100)
      expect(result?.builds[1]?.value).toBe(200)
    })
  })
})
