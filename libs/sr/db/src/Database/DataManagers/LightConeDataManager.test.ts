import { createTestDBStorage } from '@genshin-optimizer/common/database'
import {
  allLightConeKeys,
  lightConeMaxLevel,
} from '@genshin-optimizer/sr/consts'
import { SroDatabase } from '../Database'

describe('LightConeDataManager.validate', () => {
  let database: SroDatabase
  let lightCones: SroDatabase['lightCones']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('sro')
    database = new SroDatabase(1, dbStorage)
    lightCones = database.lightCones
  })

  it('should reject level exceeding max', () => {
    const invalid = {
      key: allLightConeKeys[0],
      level: lightConeMaxLevel + 1,
      ascension: 3,
      superimpose: 1,
      location: '',
      lock: false,
    }
    expect(lightCones['validate'](invalid)).toBeUndefined()
  })
})
