import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allCharacterKeys } from '@genshin-optimizer/sr/consts'
import { SroDatabase } from '../Database'

describe('BuildDataManager.validate', () => {
  let database: SroDatabase
  let builds: ReturnType<typeof database.builds>

  beforeEach(() => {
    const dbStorage = createTestDBStorage('sro')
    database = new SroDatabase(1, dbStorage)
    builds = database.builds
  })

  it('should validate valid Build', () => {
    const valid = {
      characterKey: allCharacterKeys[0],
      name: 'Test Build',
      description: 'Test description',
      relicIds: {},
      lightConeId: '',
    }
    const result = builds['validate'](valid)
    expect(result).toBeDefined()
    expect(result?.name).toBe('Test Build')
  })

  it('should return undefined for non-object types', () => {
    expect(builds['validate'](null)).toBeUndefined()
  })

  it('should apply default name if missing', () => {
    const partial = {
      characterKey: allCharacterKeys[0],
      description: 'Test',
      relicIds: {},
      lightConeId: '',
    }
    const result = builds['validate'](partial)
    expect(result).toBeDefined()
    expect(typeof result?.name).toBe('string')
  })

  it('should apply default description if missing', () => {
    const partial = {
      characterKey: allCharacterKeys[0],
      name: 'Test',
      relicIds: {},
      lightConeId: '',
    }
    const result = builds['validate'](partial)
    expect(result).toBeDefined()
    expect(result?.description).toBe('')
  })
})
