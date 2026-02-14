import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allCharacterKeys, talentLimits } from '@genshin-optimizer/gi/consts'
import { ArtCharDatabase } from '../ArtCharDatabase'

describe('CharacterDataManager', () => {
  let database: ArtCharDatabase
  let chars: ArtCharDatabase['chars']

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
    chars = database.chars
  })

  it('should clamp talent levels to ascension max', () => {
    const ascension = 3
    const maxTalent = talentLimits[ascension]
    const invalid = {
      key: allCharacterKeys[0],
      level: 50,
      constellation: 2,
      ascension,
      talent: { auto: 100, skill: 100, burst: 100 },
    }
    const result = chars['validate'](invalid)
    expect(result?.talent.auto).toBe(maxTalent)
    expect(result?.talent.skill).toBe(maxTalent)
    expect(result?.talent.burst).toBe(maxTalent)
  })
})
