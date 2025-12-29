import { createTestDBStorage } from '@genshin-optimizer/common/database'
import {
  allAttributeKeys,
  allDiscSetKeys,
  discSlotToMainStatKeys,
} from '@genshin-optimizer/zzz/consts'
import { ZzzDatabase } from '../Database'
import { maxBuildsToShowDefault } from './OptConfigDataManager'

describe('OptConfigDataManager', () => {
  let database: ZzzDatabase
  let optConfigs: ZzzDatabase['optConfigs']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('zzz')
    database = new ZzzDatabase(1, dbStorage)
    optConfigs = database.optConfigs
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
    expect(result?.statFilters[0]?.tag.attribute).toBeUndefined()
  })

  it('should apply default maxBuildsToShow for invalid value', () => {
    const invalid = { statFilters: [], maxBuildsToShow: 999 }
    const result = optConfigs['validate'](invalid)
    expect(result?.maxBuildsToShow).toBe(maxBuildsToShowDefault)
  })

  it('should filter invalid setFilter2 values', () => {
    const invalid = {
      statFilters: [],
      maxBuildsToShow: 5,
      setFilter2: ['INVALID', allDiscSetKeys[0]],
    }
    const result = optConfigs['validate'](invalid)
    expect(result?.setFilter2).toEqual([allDiscSetKeys[0]])
  })

  it('should filter invalid slot4 values', () => {
    const invalid = {
      statFilters: [],
      maxBuildsToShow: 5,
      slot4: ['INVALID', discSlotToMainStatKeys['4'][0]],
    }
    const result = optConfigs['validate'](invalid)
    expect(result?.slot4).toEqual([discSlotToMainStatKeys['4'][0]])
  })

  it('should remove invalid generatedBuildListId', () => {
    const invalid = {
      statFilters: [],
      maxBuildsToShow: 5,
      generatedBuildListId: 'INVALID_ID',
    }
    const result = optConfigs['validate'](invalid)
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
    expect(result?.generatedBuildListId).toBe(buildListId)
  })
})
