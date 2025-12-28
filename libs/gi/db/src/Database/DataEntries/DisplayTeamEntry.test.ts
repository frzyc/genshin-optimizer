import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { ArtCharDatabase } from '../ArtCharDatabase'

describe('DisplayTeamEntry', () => {
  let database: ArtCharDatabase
  let displayTeam: ArtCharDatabase['displayTeam']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
    displayTeam = database.displayTeam
  })

  it('should validate complete DisplayTeam', () => {
    const valid = {
      sortType: 'lastEdit' as const,
      ascending: false,
    }
    const result = displayTeam['validate'](valid)
    expect(result?.sortType).toBe('lastEdit')
  })
})
