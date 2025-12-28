import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { ArtCharDatabase } from '../ArtCharDatabase'

describe('DisplayTool', () => {
  let database: ArtCharDatabase
  let displayTool: ArtCharDatabase['displayTool']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
    displayTool = database.displayTool
  })

  it('should validate complete DisplayTool', () => {
    const valid = { tcMode: false }
    const result = displayTool['validate'](valid)
    expect(result?.tcMode).toBe(false)
  })
})
