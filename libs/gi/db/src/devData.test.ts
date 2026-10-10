import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allArtifactSlotKeys } from '@genshin-optimizer/gi/consts'
import { ArtCharDatabase } from './Database'
import { addDevData, randomDevArtifact } from './devData'

describe('devData', () => {
  it('generates valid 5-star Lv.20 artifacts', () => {
    for (let i = 0; i < 50; i++) {
      const art = randomDevArtifact()
      expect(art.rarity).toBe(5)
      expect(art.level).toBe(20)
      expect(art.substats.filter((s) => s.key).length).toBe(4)
    }
  })

  it('generates artifacts for every slot', () => {
    for (const slotKey of allArtifactSlotKeys) {
      const art = randomDevArtifact(slotKey)
      expect(art.slotKey).toBe(slotKey)
      expect(
        art.substats.every((sub) => !sub.key || sub.key !== art.mainStatKey)
      ).toBe(true)
    }
  })

  it('adds dev artifacts and 5-star weapons to a database', () => {
    const database = new ArtCharDatabase(1, createTestDBStorage('go'))
    const { artsAdded, weaponsAdded } = addDevData(database)

    expect(artsAdded).toBe(1000)
    expect(weaponsAdded).toBeGreaterThan(0)
    expect(database.arts.values.length).toBe(1000)
    expect(database.weapons.values.length).toBe(weaponsAdded)
    for (const weapon of database.weapons.values) {
      expect(weapon.level).toBe(90)
      expect(weapon.ascension).toBe(6)
      expect(weapon.refinement).toBe(5)
    }
  })
})
