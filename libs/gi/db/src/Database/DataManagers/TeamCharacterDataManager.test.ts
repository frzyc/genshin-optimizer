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

  it('should validate complete TeamCharacter', () => {
    const valid = {
      key: allCharacterKeys[0],
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
    const result = teamChars['validate'](valid)
    expect(result?.key).toBe(allCharacterKeys[0])
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
