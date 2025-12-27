import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allCharacterKeys } from '@genshin-optimizer/sr/consts'
import { SroDatabase } from '../Database'

describe('TeamDataManager.validate', () => {
  let database: SroDatabase
  let teams: ReturnType<typeof database.teams>

  beforeEach(() => {
    const dbStorage = createTestDBStorage('sro')
    database = new SroDatabase(1, dbStorage)
    teams = database.teams
  })

  it('should validate valid Team', () => {
    const valid = {
      name: 'Test Team',
      description: 'Test description',
      loadoutData: [],
    }
    const result = teams['validate'](valid)
    expect(result).toBeDefined()
    expect(result?.name).toBe('Test Team')
  })

  it('should return undefined for non-object types', () => {
    expect(teams['validate'](null)).toBeUndefined()
  })

  it('should apply default name if missing', () => {
    const partial = {
      description: 'Test',
      loadoutData: [],
    }
    const result = teams['validate'](partial)
    expect(result).toBeDefined()
    expect(typeof result?.name).toBe('string')
  })

  it('should apply default description if missing', () => {
    const partial = {
      name: 'Test',
      loadoutData: [],
    }
    const result = teams['validate'](partial)
    expect(result).toBeDefined()
    expect(result?.description).toBe('')
  })

  it('should apply default teamMetadata if not array', () => {
    const invalid = {
      name: 'Test',
      description: 'Test',
      teamMetadata: 'not an array' as any,
      lastEdit: 0,
      frames: [],
      conditionals: [],
      bonusStats: [],
      statConstraints: [],
    }
    const result = teams['validate'](invalid)
    expect(result).toBeDefined()
    // teamMetadata defaults to an array of undefineds (range(0, 3) produces 4 elements: 0,1,2,3)
    expect(result?.teamMetadata).toHaveLength(4)
  })
})
