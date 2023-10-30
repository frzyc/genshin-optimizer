import { DBLocalStorage } from '@genshin-optimizer/database'
import { randomizeArtifact } from '@genshin-optimizer/gi-util'
import { ArtCharDatabase } from './Database'

const dbStorage = new DBLocalStorage(localStorage)
const dbIndex = 1
let database = new ArtCharDatabase(dbIndex, dbStorage)

describe('Database', () => {
  beforeEach(() => {
    dbStorage.clear()
    database = new ArtCharDatabase(dbIndex, dbStorage)
  })

  test('DataManager.set', () => {
    const invalid = database.arts.set('INVALID', () => ({ level: 0 }))
    expect(invalid).toEqual(false)
    expect(database.arts.values.length).toEqual(0)
    const id = 'testid'
    database.arts.set(id, randomizeArtifact({ level: 0 }))
    expect(database.arts.get(id)?.level).toEqual(0)

    database.arts.set(id, (art) => {
      art.level = art.level + 4
    })
    expect(database.arts.get(id)?.level).toEqual(4)

    database.arts.set(id, ({ level }) => ({ level: level + 4 }))
    expect(database.arts.get(id)?.level).toEqual(8)
  })
})
