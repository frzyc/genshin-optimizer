import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { ArtCharDatabase } from '../ArtCharDatabase'

describe('DisplayArchiveEntry.validate', () => {
  let database: ArtCharDatabase
  let displayArchive: ArtCharDatabase['displayArchive']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
    displayArchive = database.displayArchive
  })

  it('should validate valid DisplayArchive', () => {
    const valid = {
      artifact: { rarity: [5] },
      character: {
        rarity: [5],
        weaponType: ['sword'],
        sortOrder: 'desc' as const,
        sortOrderBy: 'name' as const,
      },
      weapon: {
        rarity: [5],
        weaponType: ['sword'],
        subStat: [],
        sortOrder: 'desc' as const,
        sortOrderBy: 'name' as const,
      },
    }
    const result = displayArchive['validate'](valid)
    expect(result).toBeDefined()
    expect(result?.artifact).toBeDefined()
    expect(result?.character).toBeDefined()
    expect(result?.weapon).toBeDefined()
  })

  it('should return undefined for non-object types', () => {
    expect(displayArchive['validate'](null)).toBeUndefined()
  })
})
