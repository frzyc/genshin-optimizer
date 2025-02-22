import { DBLocalStorage } from '@genshin-optimizer/common/database'
import { ZzzDatabase } from './Database'

const dbStorage = new DBLocalStorage(localStorage, 'zzz')
const dbIndex = 1
let database = new ZzzDatabase(dbIndex, dbStorage)

describe('Database', () => {
  beforeEach(() => {
    dbStorage.clear()
    database = new ZzzDatabase(dbIndex, dbStorage)
  })
  test('initialValue', () => {
    expect(database.dbMeta.get().lastEdit).toEqual(0)
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
