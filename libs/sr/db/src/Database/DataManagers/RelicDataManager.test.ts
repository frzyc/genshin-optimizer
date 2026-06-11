import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allRelicSetKeys, relicMaxLevel } from '@genshin-optimizer/sr/consts'
import { SroDatabase } from '../Database'

describe('RelicDataManager.validate', () => {
  let database: SroDatabase
  let relics: SroDatabase['relics']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('sro')
    database = new SroDatabase(1, dbStorage)
    relics = database.relics
  })

  it('should reject level exceeding max for rarity', () => {
    const invalid = {
      setKey: allRelicSetKeys[0],
      rarity: 5,
      level: relicMaxLevel[5] + 1,
      slotKey: 'head',
      mainStatKey: 'hp',
      substats: [],
      location: '',
      lock: false,
    }
    expect(relics['validate'](invalid)).toBeUndefined()
  })

  it('should reject substat with same key as mainstat', () => {
    const invalid = {
      setKey: allRelicSetKeys[0],
      rarity: 5,
      level: 10,
      slotKey: 'head',
      mainStatKey: 'hp',
      substats: [{ key: 'hp', value: 100 }],
      location: '',
      lock: false,
    }
    expect(relics['validate'](invalid)).toBeUndefined()
  })
})
