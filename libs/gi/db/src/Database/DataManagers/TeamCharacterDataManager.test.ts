import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allCharacterKeys } from '@genshin-optimizer/gi/consts'
import { ArtCharDatabase } from '../ArtCharDatabase'

describe('TeamCharacterDataManager', () => {
  let database: ArtCharDatabase
  let teamChars: ArtCharDatabase['teamChars']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
    teamChars = database.teamChars
  })

  it('should reject invalid character key', () => {
    const invalid = {
      key: 'INVALID_KEY',
      optConfigId: '',
      buildType: 'real' as const,
      buildId: '',
      buildTcId: '',
      compareAgainst: '',
      customMultiTargets: [],
      bonusStats: {},
      enemyOverride: {},
      conditionalValues: {},
      infusionAura: '',
    }
    expect(teamChars['validate'](invalid)).toBeUndefined()
  })
})
