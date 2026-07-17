import {
  allArtifactSetKeys,
  allSubstatKeys,
  artSlotMainKeys,
} from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  getMainStatValue,
  getSubstatValue,
  getTotalPossibleRolls,
} from '@genshin-optimizer/gi/util'
import { futureArtifactProfiles } from './futureProfiles'

describe('futureArtifactProfiles', () => {
  test('one profile per allowed (slot, set, main stat) combo', () => {
    const profiles = futureArtifactProfiles()
    for (const [slot, mains] of Object.entries(artSlotMainKeys)) {
      const sets = allArtifactSetKeys.filter((set) =>
        allStats.art.data[set].slots.includes(slot as never)
      )
      expect(profiles[slot as keyof typeof profiles]!.length).toBe(
        sets.length * mains.length
      )
    }
    // circlet-only sets must not appear in other slots
    const flowerSets = new Set(
      profiles.flower!.map((p) => Object.keys(p.fixed).find((k) => k !== 'hp')!)
    )
    expect(flowerSets.has('PrayersForWisdom')).toBe(false)
  })

  test('mainStatKeys filter restricts profiles; empty list allows all', () => {
    const profiles = futureArtifactProfiles({
      goblet: ['hydro_dmg_'],
      sands: [],
    })
    expect(
      profiles.goblet!.every((p) => p.fixed['hydro_dmg_'] !== undefined)
    ).toBe(true)
    const sandsMains = new Set(
      profiles.sands!.flatMap((p) =>
        Object.keys(p.fixed).filter((k) =>
          (artSlotMainKeys.sands as readonly string[]).includes(k)
        )
      )
    )
    expect(sandsMains.size).toBe(artSlotMainKeys.sands.length)
  })

  test('profile describes a fully-leveled artifact in dyn-stat space', () => {
    const { flower } = futureArtifactProfiles()
    const p = flower!.find((p) => p.fixed['HeartOfDepth'] === 1)!
    // max-level 5* flower main stat, raw datamine units
    expect(p.fixed).toEqual({ HeartOfDepth: 1, hp: 4780 })
    expect(p.maxSubstats).toBe(4)
    expect(p.rollBudget!.totalRolls).toBe(getTotalPossibleRolls(5))

    // pool: every substat except the main stat, six max rolls apiece
    expect(Object.keys(p.substats).sort()).toEqual(
      allSubstatKeys.filter((k) => (k as string) !== 'hp').sort()
    )
    for (const [k, { min, max }] of Object.entries(p.substats)) {
      const roll = getSubstatValue(
        k as (typeof allSubstatKeys)[number],
        5,
        'max',
        false
      )
      expect(p.rollBudget!.rollSize[k]).toBe(roll)
      expect(min).toBe(0)
      expect(max).toBeCloseTo(6 * roll, 12)
    }
    // dyn space uses fractional values for % keys (matches compactArtifacts)
    expect(p.substats['critRate_'].max).toBeLessThan(1)
  })

  test('main stat and budget follow the set rarity', () => {
    const { sands } = futureArtifactProfiles({ sands: ['atk_'] })
    // TheExile caps at 4*
    const p = sands!.find((p) => p.fixed['TheExile'] === 1)!
    expect(p.fixed['atk_']).toBe(getMainStatValue('atk_', 4, 16))
    expect(p.rollBudget!.totalRolls).toBe(getTotalPossibleRolls(4))
    expect(p.rollBudget!.rollSize['critRate_']).toBe(
      getSubstatValue('critRate_', 4, 'max', false)
    )
    // atk_ is the main stat: not in the substat pool
    expect(p.substats['atk_']).toBeUndefined()
  })
})
