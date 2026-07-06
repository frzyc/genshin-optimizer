import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allArtifactSetKeys, artMaxLevel } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { ArtCharDatabase } from '../ArtCharDatabase'

describe('ArtifactDataManager', () => {
  let database: ArtCharDatabase
  let artifacts: ArtCharDatabase['arts']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
    artifacts = database.arts
  })

  function getValidFlowerSetKey() {
    return allArtifactSetKeys.find(
      (setKey) =>
        allStats.art.data[setKey].slots.includes('flower') &&
        allStats.art.data[setKey].rarities.includes(5)
    )!
  }

  it('should reject level exceeding max for rarity', () => {
    const validSetKey = getValidFlowerSetKey()
    const invalid = {
      setKey: validSetKey,
      rarity: 5,
      level: artMaxLevel[5] + 1,
      slotKey: 'flower',
      mainStatKey: 'hp',
      substats: [],
      location: '',
      lock: false,
    }
    expect(artifacts['validate'](invalid)).toBeUndefined()
  })

  it('should reject substat with same key as mainstat', () => {
    const validSetKey = getValidFlowerSetKey()
    const invalid = {
      setKey: validSetKey,
      rarity: 5,
      level: 10,
      slotKey: 'flower',
      mainStatKey: 'hp',
      substats: [{ key: 'hp', value: 100 }],
      location: '',
      lock: false,
    }
    expect(artifacts['validate'](invalid)).toBeUndefined()
  })
})
