import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { ArtCharDatabase } from '../ArtCharDatabase'

describe('BuildDataManager', () => {
  let database: ArtCharDatabase
  let builds: ArtCharDatabase['builds']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
    builds = database.builds
  })

  it('should validate complete Build', () => {
    const valid = {
      name: 'Test Build',
      description: 'Test description',
      artifactIds: {},
      weaponId: '',
    }
    const result = builds['validate'](valid)
    expect(result?.name).toBe('Test Build')
    expect(result?.description).toBe('Test description')
  })
})
