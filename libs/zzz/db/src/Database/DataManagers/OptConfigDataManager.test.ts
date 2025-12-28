import { createTestDBStorage } from '@genshin-optimizer/common/database'
import {
  allAttributeKeys,
  allDiscSetKeys,
  allSpecialityKeys,
  discMaxLevel,
  discSlotToMainStatKeys,
  wengineMaxLevel,
} from '@genshin-optimizer/zzz/consts'
import { ZzzDatabase } from '../Database'
import {
  maxBuildsToShowDefault,
  maxBuildsToShowList,
  statFilterStatKeys,
  statFilterStatQtKeys,
} from './OptConfigDataManager'

describe('OptConfigDataManager.validate', () => {
  let database: ZzzDatabase
  let optConfigs: ZzzDatabase['optConfigs']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('zzz')
    database = new ZzzDatabase(1, dbStorage)
    optConfigs = database.optConfigs
  })

  describe('valid inputs', () => {
    it('should validate valid OptConfig', () => {
      const valid = {
        statFilters: [],
        maxBuildsToShow: 5,
        levelLow: 0,
        levelHigh: 15,
        slot4: [],
        slot5: [],
        slot6: [],
        setFilter2: [],
        setFilter4: [],
        useEquipped: false,
        optWengine: false,
        wlevelLow: 0,
        wlevelHigh: 60,
        wEngineTypes: [],
        useEquippedWengine: false,
      }
      const result = optConfigs['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.maxBuildsToShow).toBe(5)
    })

    it('should validate with statFilters', () => {
      const valid = {
        statFilters: [
          {
            tag: { q: 'hp' as const, qt: 'final' as const },
            value: 1000,
            isMax: false,
            disabled: false,
          },
        ],
        maxBuildsToShow: 5,
        levelLow: 0,
        levelHigh: 15,
        slot4: [],
        slot5: [],
        slot6: [],
        setFilter2: [],
        setFilter4: [],
        useEquipped: false,
        optWengine: false,
        wlevelLow: 0,
        wlevelHigh: 60,
        wEngineTypes: [],
        useEquippedWengine: false,
      }
      const result = optConfigs['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.statFilters).toHaveLength(1)
      expect(result?.statFilters[0]?.tag.q).toBe('hp')
    })

    it('should validate dmg_ statFilter with attribute', () => {
      const valid = {
        statFilters: [
          {
            tag: {
              q: 'dmg_' as const,
              qt: 'final' as const,
              attribute: allAttributeKeys[0],
            },
            value: 100,
            isMax: true,
            disabled: false,
          },
        ],
        maxBuildsToShow: 5,
        levelLow: 0,
        levelHigh: 15,
        slot4: [],
        slot5: [],
        slot6: [],
        setFilter2: [],
        setFilter4: [],
        useEquipped: false,
        optWengine: false,
        wlevelLow: 0,
        wlevelHigh: 60,
        wEngineTypes: [],
        useEquippedWengine: false,
      }
      const result = optConfigs['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.statFilters[0]?.tag.attribute).toBe(allAttributeKeys[0])
    })
  })

  describe('invalid types', () => {
    it('should return undefined for non-object types', () => {
      expect(optConfigs['validate'](null)).toBeUndefined()
      expect(optConfigs['validate'](undefined)).toBeUndefined()
      expect(optConfigs['validate']('string')).toBeUndefined()
      expect(optConfigs['validate'](123)).toBeUndefined()
      expect(optConfigs['validate'](true)).toBeUndefined()
      expect(optConfigs['validate']([])).toBeUndefined()
    })
  })

  describe('default values', () => {
    it('should apply default statFilters if not array', () => {
      const invalid = {
        statFilters: 'not an array',
        maxBuildsToShow: 5,
      }
      const result = optConfigs['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.statFilters).toEqual([])
    })

    it('should apply default maxBuildsToShow for invalid value', () => {
      const invalid = {
        statFilters: [],
        maxBuildsToShow: 999,
      }
      const result = optConfigs['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.maxBuildsToShow).toBe(maxBuildsToShowDefault)
    })

    it('should apply default levelLow if undefined', () => {
      const partial = {
        statFilters: [],
        maxBuildsToShow: 5,
      }
      const result = optConfigs['validate'](partial)
      expect(result).toBeDefined()
      expect(result?.levelLow).toBe(0)
    })

    it('should apply default levelHigh if undefined', () => {
      const partial = {
        statFilters: [],
        maxBuildsToShow: 5,
      }
      const result = optConfigs['validate'](partial)
      expect(result).toBeDefined()
      expect(result?.levelHigh).toBe(discMaxLevel['S'])
    })

    it('should apply default wlevelLow if undefined', () => {
      const partial = {
        statFilters: [],
        maxBuildsToShow: 5,
      }
      const result = optConfigs['validate'](partial)
      expect(result).toBeDefined()
      expect(result?.wlevelLow).toBe(0)
    })

    it('should apply default wlevelHigh if undefined', () => {
      const partial = {
        statFilters: [],
        maxBuildsToShow: 5,
      }
      const result = optConfigs['validate'](partial)
      expect(result).toBeDefined()
      expect(result?.wlevelHigh).toBe(wengineMaxLevel)
    })

    it('should coerce useEquipped to boolean', () => {
      const invalid = {
        statFilters: [],
        maxBuildsToShow: 5,
        useEquipped: 1,
      }
      const result = optConfigs['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.useEquipped).toBe(true)
    })

    it('should coerce optWengine to boolean', () => {
      const invalid = {
        statFilters: [],
        maxBuildsToShow: 5,
        optWengine: 'true',
      }
      const result = optConfigs['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.optWengine).toBe(true)
    })
  })

  describe('statFilter validation', () => {
    it('should apply default q for invalid value', () => {
      const invalid = {
        statFilters: [
          {
            tag: { q: 'INVALID', qt: 'final' },
            value: 100,
            isMax: false,
            disabled: false,
          },
        ],
        maxBuildsToShow: 5,
      }
      const result = optConfigs['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.statFilters[0]?.tag.q).toBe(statFilterStatKeys[0])
    })

    it('should apply default qt for invalid value', () => {
      const invalid = {
        statFilters: [
          {
            tag: { q: 'hp', qt: 'INVALID' },
            value: 100,
            isMax: false,
            disabled: false,
          },
        ],
        maxBuildsToShow: 5,
      }
      const result = optConfigs['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.statFilters[0]?.tag.qt).toBe(statFilterStatQtKeys[0])
    })

    it('should remove attribute if q is not dmg_', () => {
      const invalid = {
        statFilters: [
          {
            tag: { q: 'hp', qt: 'final', attribute: allAttributeKeys[0] },
            value: 100,
            isMax: false,
            disabled: false,
          },
        ],
        maxBuildsToShow: 5,
      }
      const result = optConfigs['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.statFilters[0]?.tag.attribute).toBeUndefined()
    })

    it('should apply default value if not number', () => {
      const invalid = {
        statFilters: [
          {
            tag: { q: 'hp', qt: 'final' },
            value: 'not a number',
            isMax: false,
            disabled: false,
          },
        ],
        maxBuildsToShow: 5,
      }
      const result = optConfigs['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.statFilters[0]?.value).toBe(0)
    })

    it('should coerce isMax to boolean', () => {
      const invalid = {
        statFilters: [
          {
            tag: { q: 'hp', qt: 'final' },
            value: 100,
            isMax: 1,
            disabled: false,
          },
        ],
        maxBuildsToShow: 5,
      }
      const result = optConfigs['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.statFilters[0]?.isMax).toBe(true)
    })

    it('should coerce disabled to boolean', () => {
      const invalid = {
        statFilters: [
          {
            tag: { q: 'hp', qt: 'final' },
            value: 100,
            isMax: false,
            disabled: 'yes',
          },
        ],
        maxBuildsToShow: 5,
      }
      const result = optConfigs['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.statFilters[0]?.disabled).toBe(true)
    })
  })

  describe('array validation', () => {
    it('should filter invalid setFilter2 values', () => {
      const invalid = {
        statFilters: [],
        maxBuildsToShow: 5,
        setFilter2: ['INVALID', allDiscSetKeys[0]],
      }
      const result = optConfigs['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.setFilter2).toEqual([allDiscSetKeys[0]])
    })

    it('should filter invalid setFilter4 values', () => {
      const invalid = {
        statFilters: [],
        maxBuildsToShow: 5,
        setFilter4: ['INVALID', allDiscSetKeys[0]],
      }
      const result = optConfigs['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.setFilter4).toEqual([allDiscSetKeys[0]])
    })

    it('should filter invalid slot4 values', () => {
      const invalid = {
        statFilters: [],
        maxBuildsToShow: 5,
        slot4: ['INVALID', discSlotToMainStatKeys['4'][0]],
      }
      const result = optConfigs['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.slot4).toEqual([discSlotToMainStatKeys['4'][0]])
    })

    it('should filter invalid wEngineTypes values', () => {
      const invalid = {
        statFilters: [],
        maxBuildsToShow: 5,
        wEngineTypes: ['INVALID', allSpecialityKeys[0]],
      }
      const result = optConfigs['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.wEngineTypes).toEqual([allSpecialityKeys[0]])
    })
  })

  describe('generatedBuildListId validation', () => {
    it('should remove invalid generatedBuildListId', () => {
      const invalid = {
        statFilters: [],
        maxBuildsToShow: 5,
        generatedBuildListId: 'INVALID_ID',
      }
      const result = optConfigs['validate'](invalid)
      expect(result).toBeDefined()
      expect(result?.generatedBuildListId).toBeUndefined()
    })

    it('should keep valid generatedBuildListId', () => {
      const buildListId = database.generatedBuildList.new({
        builds: [],
        buildDate: 12345,
      })

      const valid = {
        statFilters: [],
        maxBuildsToShow: 5,
        generatedBuildListId: buildListId,
      }
      const result = optConfigs['validate'](valid)
      expect(result).toBeDefined()
      expect(result?.generatedBuildListId).toBe(buildListId)
    })
  })

  describe('edge cases', () => {
    it('should handle empty object', () => {
      const result = optConfigs['validate']({})
      expect(result).toBeDefined()
      expect(result?.statFilters).toEqual([])
      expect(result?.maxBuildsToShow).toBe(maxBuildsToShowDefault)
    })

    it('should validate all valid maxBuildsToShow values', () => {
      maxBuildsToShowList.forEach((maxBuilds) => {
        const valid = {
          statFilters: [],
          maxBuildsToShow: maxBuilds,
        }
        const result = optConfigs['validate'](valid)
        expect(result).toBeDefined()
        expect(result?.maxBuildsToShow).toBe(maxBuilds)
      })
    })
  })
})
