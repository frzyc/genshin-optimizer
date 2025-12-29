import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allRelicSetKeys } from '@genshin-optimizer/sr/consts'
import { SroDatabase } from '../Database'
import { maxBuildsToShowDefault } from './OptConfigDataManager'

describe('OptConfigDataManager.validate', () => {
  let database: SroDatabase
  let optConfigs: SroDatabase['optConfigs']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('sro')
    database = new SroDatabase(1, dbStorage)
    optConfigs = database.optConfigs
  })

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

  it('should filter invalid setFilter2Cavern values', () => {
    const invalid = {
      statFilters: [],
      maxBuildsToShow: 5,
      setFilter2Cavern: ['INVALID' as any, allRelicSetKeys[0]],
    }
    const result = optConfigs['validate'](invalid)
    expect(result).toBeDefined()
    expect(result?.setFilter2Cavern).toEqual([allRelicSetKeys[0]])
  })
})
