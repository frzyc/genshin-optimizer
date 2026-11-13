import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import {
  cavernTwoPcGroups,
  cavernTwoPcSets,
  planarTwoPcGroups,
  planarTwoPcSets,
} from '@genshin-optimizer/sr/stats'

function cavernWith(stats: Record<string, number>): RelicSetKey[] | undefined {
  const id = Object.keys(stats)
    .sort()
    .map((key) => `${key}=${stats[key]}`)
    .join('&')
  return cavernTwoPcGroups.find((group) => group.id === id)?.sets
}

describe('relic 2pc groups', () => {
  test('merges cavern sets whose 2-piece is only ATK%', () => {
    expect(cavernWith({ atk_: 0.12 })).toEqual([
      'HeroOfTriumphantSong',
      'MusketeerOfWildWheat',
      'PrisonerInDeepConfinement',
      'TheWindSoaringValorous',
    ])
  })

  test('leaves conditional cavern 2-pieces as their own rows', () => {
    for (const set of [
      'GuardOfWutheringSnow',
      'TheAshblazingGrandDuke',
      'PioneerDiverOfDeadWaters',
    ] as const) {
      const group = cavernTwoPcGroups.find((entry) => entry.id === `set:${set}`)
      expect(group?.sets).toEqual([set])
      expect(group?.stats).toBeUndefined()
    }
    expect(cavernWith({ atk_: 0.12 })).not.toContain(
      'FirmamentFrontlineGlamoth'
    )
  })

  test('keeps planar conditionals off the plain ATK% row', () => {
    const planarAtk = planarTwoPcGroups.find(
      (group) => group.stats?.atk_ === 0.12
    )
    expect(planarAtk).toBeUndefined()
    const sealing = planarTwoPcGroups.find(
      (group) => group.id === 'set:SpaceSealingStation'
    )
    expect(sealing?.sets).toEqual(['SpaceSealingStation'])
    expect(sealing?.stats).toBeUndefined()
  })

  test('cavern and planar pools do not share sets', () => {
    const overlap = cavernTwoPcSets.filter((set) =>
      (planarTwoPcSets as readonly string[]).includes(set)
    )
    expect(overlap).toEqual([])
    expect(cavernTwoPcSets).toHaveLength(
      cavernTwoPcGroups.flatMap((group) => group.sets).length
    )
    expect(planarTwoPcSets.length).toBeGreaterThan(0)
  })
})
