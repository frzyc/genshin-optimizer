import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { ArtCharDatabase } from '../ArtCharDatabase'

describe('DisplayTool.validate', () => {
  let database: ArtCharDatabase
  let displayTool: ArtCharDatabase['displayTool']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
    displayTool = database.displayTool
  })

  it('should validate valid DisplayTool', () => {
    const valid = {
      tcMode: false,
    }
    const result = displayTool['validate'](valid)
    expect(result).toBeDefined()
    expect(result?.tcMode).toBe(false)
  })

  it('should return undefined for non-object types', () => {
    expect(displayTool['validate'](null)).toBeUndefined()
  })

  it('should coerce tcMode to boolean', () => {
    const invalid = {
      tcMode: 'yes',
    }
    const result = displayTool['validate'](invalid)
    expect(result).toBeDefined()
    expect(result?.tcMode).toBe(true)
  })
})
