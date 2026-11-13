import {
  allDiscSetKeys,
  discTwoPcGroups,
  discTwoPcSets,
} from '@genshin-optimizer/zzz/consts'

function setsWith(stats: Record<string, number>) {
  const id = Object.keys(stats)
    .sort()
    .map((key) => `${key}=${stats[key]}`)
    .join('&')
  return discTwoPcGroups.find((group) => group.id === id)?.sets
}

describe('disc 2pc groups', () => {
  test('merges duplicate basic 2-pieces', () => {
    expect(setsWith({ atk_: 0.1 })).toEqual(['AstralVoice', 'HormonePunk'])
    expect(setsWith({ hp_: 0.1 })).toEqual(['BunnyInWonderland', 'YunkuiTales'])
    expect(setsWith({ anomProf: 30 })).toEqual([
      'ChaosJazz',
      'FeatheredFate',
      'FreedomBlues',
    ])
    expect(setsWith({ ether_dmg_: 0.1 })).toEqual([
      'ChaoticMetal',
      'ShiningAria',
      'TheSkyAblaze',
    ])
  })

  test('keeps formula specials as their own rows', () => {
    for (const set of ['DawnsBloom', 'ShadowHarmony'] as const) {
      const group = discTwoPcGroups.find((entry) => entry.id === `set:${set}`)
      expect(group?.sets).toEqual([set])
      expect(group?.stats).toBeUndefined()
    }
  })

  test('covers every disc set once', () => {
    const seen = discTwoPcGroups.flatMap((group) => group.sets)
    expect(seen).toEqual(discTwoPcSets)
    expect([...seen].sort()).toEqual([...allDiscSetKeys].sort())
  })
})
