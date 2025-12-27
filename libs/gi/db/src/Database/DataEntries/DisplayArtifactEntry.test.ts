import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allArtifactSetKeys, allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import { ArtCharDatabase } from '../ArtCharDatabase'

describe('DisplayArtifactEntry.validate', () => {
  let database: ArtCharDatabase
  let displayArtifact: ReturnType<typeof database.displayArtifact>

  beforeEach(() => {
    const dbStorage = createTestDBStorage('go')
    database = new ArtCharDatabase(1, dbStorage)
    displayArtifact = database.displayArtifact
  })

  it('should validate valid DisplayArtifact', () => {
    const valid = {
      filterOption: {
        artSetKeys: [],
        rarity: [5, 4, 3, 2, 1],
        levelLow: 0,
        levelHigh: 20,
        slotKeys: [...allArtifactSlotKeys],
        mainStatKeys: [],
        substats: [],
        locations: [],
        showEquipped: true,
        showInventory: true,
        locked: ['locked', 'unlocked'],
        rvLow: 0,
        rvHigh: 900,
        useMaxRV: false,
        lines: [1, 2, 3, 4],
      },
      ascending: false,
      sortType: 'rarity' as const,
      effFilter: [],
    }
    const result = displayArtifact['validate'](valid)
    expect(result).toBeDefined()
  })

  it('should return undefined for non-object types', () => {
    expect(displayArtifact['validate'](null)).toBeUndefined()
  })

  it('should clamp levelLow to valid range', () => {
    const invalid = {
      filterOption: {
        artSetKeys: [],
        rarity: [5],
        levelLow: -5,
        levelHigh: 20,
        slotKeys: [...allArtifactSlotKeys],
        mainStatKeys: [],
        substats: [],
        locations: [],
        showEquipped: true,
        showInventory: true,
        locked: ['locked', 'unlocked'],
        rvLow: 0,
        rvHigh: 900,
        useMaxRV: false,
        lines: [1, 2, 3, 4],
      },
      ascending: false,
      sortType: 'rarity' as const,
      effFilter: [],
    }
    const result = displayArtifact['validate'](invalid)
    expect(result).toBeDefined()
    expect(result?.filterOption.levelLow).toBe(0)
  })
})
