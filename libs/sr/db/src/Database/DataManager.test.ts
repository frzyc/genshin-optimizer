import { DBLocalStorage } from '@genshin-optimizer/common/database'
import { randomizeRelic } from '@genshin-optimizer/sr/util'
import { SroDatabase } from './Database'

const dbStorage = new DBLocalStorage(localStorage, 'sro')
const dbIndex = 1
let database = new SroDatabase(dbIndex, dbStorage)

describe('Database', () => {
  beforeEach(() => {
    dbStorage.clear()
    database = new SroDatabase(dbIndex, dbStorage)
  })

  test('DataManager.set', () => {
    const invalid = database.relics.set('INVALID', () => ({ level: 0 }))
    expect(invalid).toEqual(false)
    expect(database.relics.values.length).toEqual(0)
    const id = 'testid'
    database.relics.set(id, randomizeRelic({ rarity: 4, level: 0 }))
    expect(database.relics.get(id)?.level).toEqual(0)

    database.relics.set(id, (art) => {
      art.level = art.level + 3
    })
    expect(database.relics.get(id)?.level).toEqual(3)

    database.relics.set(id, ({ level }) => ({ level: level + 3 }))
    expect(database.relics.get(id)?.level).toEqual(6)
  })
})
