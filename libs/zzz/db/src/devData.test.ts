import { createTestDBStorage } from '@genshin-optimizer/common/database'
import { allDiscSlotKeys } from '@genshin-optimizer/zzz/consts'
import { validateDiscWithErrors } from '@genshin-optimizer/zzz/zood'
import { ZzzDatabase } from './Database'
import { addDevData, randomDevDisc } from './devData'

describe('devData', () => {
  it('generates valid S-rank Lv.15 discs', () => {
    for (let i = 0; i < 50; i++) {
      const disc = randomDevDisc()
      const { validatedDisc, errors } = validateDiscWithErrors(disc)
      expect(errors).toHaveLength(0)
      expect(validatedDisc).toBeDefined()
      expect(disc.rarity).toBe('S')
      expect(disc.level).toBe(15)
      expect(disc.substats).toHaveLength(4)
    }
  })

  it('generates discs for every slot', () => {
    for (const slotKey of allDiscSlotKeys) {
      const disc = randomDevDisc(slotKey)
      expect(disc.slotKey).toBe(slotKey)
      expect(disc.substats.every((sub) => sub.key !== disc.mainStatKey)).toBe(
        true
      )
    }
  })

  it('adds dev discs and S-rank wengines to a database', () => {
    const database = new ZzzDatabase(1, createTestDBStorage('zzz'))
    const { discsAdded, wenginesAdded } = addDevData(database)

    expect(discsAdded).toBe(1000)
    expect(wenginesAdded).toBeGreaterThan(0)
    expect(database.discs.values.length).toBe(1000)
    expect(database.wengines.values.length).toBe(wenginesAdded)
    for (const wengine of database.wengines.values) {
      expect(wengine.level).toBe(60)
      expect(wengine.modification).toBe(5)
      expect(wengine.phase).toBe(5)
    }
  })
})
