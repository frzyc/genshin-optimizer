import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { ArtCharDatabase } from '../ArtCharDatabase'

describe('DisplayTeamEntry.validate', () => {
  let database: ArtCharDatabase
  let displayTeam: ArtCharDatabase['displayTeam']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
    displayTeam = database.displayTeam
  })

  it('should validate valid DisplayTeam', () => {
    const valid = {
      sortType: 'lastEdit' as const,
      ascending: false,
    }
    const result = displayTeam['validate'](valid)
    expect(result).toBeDefined()
    expect(result?.sortType).toBe('lastEdit')
  })

  it('should return undefined for non-object types', () => {
    expect(displayTeam['validate'](null)).toBeUndefined()
  })
})
