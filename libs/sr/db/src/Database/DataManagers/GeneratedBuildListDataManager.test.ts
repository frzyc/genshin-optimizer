import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { objKeyMap } from '@genshin-optimizer/common/util'
import { allRelicSlotKeys } from '@genshin-optimizer/sr/consts'
import { SroDatabase } from '../Database'
import type { GeneratedBuildList } from './GeneratedBuildListDataManager'

describe('GeneratedBuildListDataManager.validate', () => {
  let database: SroDatabase
  let generatedBuildList: SroDatabase['generatedBuildList']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('sro')
    database = new SroDatabase(1, dbStorage)
    generatedBuildList = database.generatedBuildList
  })

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

  it('should return undefined for non-object types', () => {
    expect(generatedBuildList['validate'](null)).toBeUndefined()
  })

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

  it('should filter out builds with invalid value', () => {
    const relicIds = objKeyMap(allRelicSlotKeys, () => '')
    const invalid = {
      builds: [
        {
          value: 'not a number',
          relicIds,
        },
      ],
      buildDate: 12345,
    }
    const result = generatedBuildList['validate'](invalid)
    expect(result).toBeDefined()
    expect(result?.builds).toEqual([])
  })

  it('should handle empty object', () => {
    const result = generatedBuildList['validate']({})
    expect(result).toBeDefined()
    expect(result?.builds).toEqual([])
    expect(result?.buildDate).toBe(0)
  })
})
