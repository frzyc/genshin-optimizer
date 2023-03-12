import { ArtCharDatabase } from './Database'
import { DBLocalStorage } from './DBStorage'

const dbStorage = new DBLocalStorage(localStorage)
const dbIndex = 1
let database = new ArtCharDatabase(dbIndex, dbStorage)

describe('Database', () => {
  beforeEach(() => {
    dbStorage.clear()
    database = new ArtCharDatabase(dbIndex, dbStorage)
  })
  test('initialValue', () => {
    expect(database.dbMeta.get().gender).toEqual('F')
  })
  test('DataEntry.set', () => {
    expect(database.dbMeta.get().name).toEqual('Database 1')

    database.dbMeta.set({ name: 'test' })
    expect(database.dbMeta.get().name).toEqual('test')

    database.dbMeta.set((dbMeta) => {
      dbMeta.name = `test ${dbMeta.name}`
    })
    expect(database.dbMeta.get().name).toEqual('test test')

    database.dbMeta.set(({ name }) => ({ name: `test ${name}` }))
    expect(database.dbMeta.get().name).toEqual('test test test')
  })
})
