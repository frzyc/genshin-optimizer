import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { ArtCharDatabase } from '../ArtCharDatabase'

describe('BuildDataManager.validate', () => {
  let database: ArtCharDatabase
  let builds: ArtCharDatabase['builds']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
    builds = database.builds
  })

  it('should validate valid Build', () => {
    const valid = {
      name: 'Test Build',
      description: 'Test description',
      artifactIds: {},
      weaponId: '',
    }
    const result = builds['validate'](valid)
    expect(result).toBeDefined()
    expect(result?.name).toBe('Test Build')
  })

  it('should return undefined for non-object types', () => {
    expect(builds['validate'](null)).toBeUndefined()
  })

  it('should apply default description if missing', () => {
    const partial = {
      name: 'Test',
      artifactIds: {},
      weaponId: '',
    }
    const result = builds['validate'](partial)
    expect(result).toBeDefined()
    expect(result?.description).toBe('')
  })
})
