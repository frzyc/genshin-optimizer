import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { ArtCharDatabase } from '../ArtCharDatabase'
import type { GeneratedBuildList } from './GeneratedBuildListDataManager'

describe('GeneratedBuildListDataManager', () => {
  let database: ArtCharDatabase
  let generatedBuildList: ArtCharDatabase['generatedBuildList']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
    generatedBuildList = database.generatedBuildList
  })

  it('should validate GeneratedBuildList with empty builds', () => {
    const valid: GeneratedBuildList = {
      builds: [],
      buildDate: 12345,
    }
    const result = generatedBuildList['validate'](valid)
    expect(result?.builds).toEqual([])
    expect(result?.buildDate).toBe(12345)
  })
})
