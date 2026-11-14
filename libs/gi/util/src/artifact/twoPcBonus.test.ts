import {
  toggleTwoPcGroup,
  toggleTwoPcMember,
} from '@genshin-optimizer/common/util'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { allArtifactSetKeys } from '@genshin-optimizer/gi/consts'
import {
  artifactTwoPcGroups,
  artifactTwoPcSets,
  elementalResBonus,
} from './twoPcBonus'

function setsWith(stats: Record<string, number>): ArtifactSetKey[] {
  const id = Object.keys(stats)
    .sort()
    .map((key) => `${key}=${stats[key]}`)
    .join('&')
  return artifactTwoPcGroups.find((group) => group.id === id)?.sets ?? []
}

describe('artifact 2pc groups', () => {
  test('merges identical ATK% 18% 2-pieces', () => {
    expect(setsWith({ atk_: 0.18 })).toEqual([
      'ADayCarvedFromRisingWinds',
      'BraveHeart',
      'DisenchantmentInDeepShadow',
      'EchoesOfAnOffering',
      'FragmentOfHarmonicWhimsy',
      'GladiatorsFinale',
      'HeartOfTheFurnace',
      'NighttimeWhispersInTheEchoingWoods',
      'ResolutionOfSojourner',
      'ScarletProof',
      'ShimenawasReminiscence',
      'UnfinishedReverie',
      'VermillionHereafter',
    ])
  })

  test('merges EM, hydro, and normal/charged bonuses', () => {
    expect(setsWith({ eleMas: 80 })).toEqual([
      'AubadeOfMorningstarAndMoon',
      'FlowerOfParadiseLost',
      'GildedDreams',
      'Instructor',
      'NightOfTheSkysUnveiling',
      'WanderersTroupe',
    ])
    expect(setsWith({ hydro_dmg_: 0.15 })).toEqual([
      'HeartOfDepth',
      'NymphsDream',
    ])
    expect(setsWith({ normal_dmg_: 0.15, charged_dmg_: 0.15 })).toEqual([
      'MarechausseeHunter',
      'MartialArtist',
    ])
  })

  test('Tiny Miracle is one all-element resistance bonus', () => {
    const group = artifactTwoPcGroups.find(
      (entry) => entry.sets[0] === 'TinyMiracle'
    )
    expect(group?.sets).toEqual(['TinyMiracle'])
    expect(elementalResBonus(group?.stats)).toBe(0.2)
    expect(elementalResBonus({ pyro_res_: 0.4 })).toBeUndefined()
  })

  test('keeps conditional 2-pieces as their own rows', () => {
    for (const set of [
      'ObsidianCodex',
      'ScrollOfTheHeroOfCinderCity',
    ] as const) {
      const group = artifactTwoPcGroups.find((entry) => entry.sets[0] === set)
      expect(group?.sets).toEqual([set])
      expect(group?.stats).toBeUndefined()
    }
  })

  test('covers every set that has a 2-piece exactly once', () => {
    const seen = artifactTwoPcGroups.flatMap((group) => group.sets)
    expect(new Set(seen).size).toBe(seen.length)
    expect(seen).toEqual(artifactTwoPcSets)
    const prayers = [
      'PrayersForDestiny',
      'PrayersForIllumination',
      'PrayersForWisdom',
      'PrayersToSpringtime',
    ]
    expect(seen).not.toEqual(expect.arrayContaining(prayers))
    expect([...seen, ...prayers].sort()).toEqual([...allArtifactSetKeys].sort())
  })

  test('empty allowlist click restricts to the bonus, and one set can be left out', () => {
    const atk = setsWith({ atk_: 0.18 })
    expect(toggleTwoPcGroup([], atk, artifactTwoPcSets)).toEqual(atk)
    const withoutGladiator = toggleTwoPcMember(
      [],
      'GladiatorsFinale',
      artifactTwoPcSets
    )
    expect(withoutGladiator).not.toContain('GladiatorsFinale')
    expect(withoutGladiator).toHaveLength(artifactTwoPcSets.length - 1)
  })
})
