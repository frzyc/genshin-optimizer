import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { ArtCharDatabase } from '../ArtCharDatabase'
import type { GeneratedBuildList } from './GeneratedBuildListDataManager'

describe('GeneratedBuildListDataManager.validate', () => {
  let database: ArtCharDatabase
  let generatedBuildList: ArtCharDatabase['generatedBuildList']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
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

  it('should apply default builds if not an array', () => {
    const invalid = {
      builds: 'not an array',
      buildDate: 12345,
    }
    const result = generatedBuildList['validate'](invalid)
    expect(result).toBeDefined()
    expect(result?.builds).toEqual([])
    expect(result?.buildDate).toBe(0)
  })
})
