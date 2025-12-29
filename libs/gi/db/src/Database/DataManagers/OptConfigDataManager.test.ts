import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { ArtCharDatabase } from '../ArtCharDatabase'
import { maxBuildsToShowDefault } from './OptConfigDataManager'

describe('OptConfigDataManager', () => {
  let database: ArtCharDatabase
  let optConfigs: ArtCharDatabase['optConfigs']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
    optConfigs = database.optConfigs
  })

  it('should apply default maxBuildsToShow for invalid value', () => {
    const invalid = {
      statFilters: [],
      maxBuildsToShow: 999,
    }
    const result = optConfigs['validate'](invalid)
    expect(result?.maxBuildsToShow).toBe(maxBuildsToShowDefault)
  })
})
