/**
 * Nefer WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Num `burstVeilsAbsorbed` / `a1VeilStacks` 1–5 (WR lookup; 4–5 need C2).
 * Bool `c4ShadowDance` `'on'`. C3 skill / C5 burst.
 * A1 EM / burst_dmg_ / veil pp_mult need moonsign 2 (solo tally is 1).
 * A0 team lunarbloom_baseDmg_ / C6 specialDmg_ are dmg_.lunarbloom (not
 * DEFAULT_FINALS). C4 is WR teamBuff dendro_enemyRes_ → enemy preRes.
 * Lunar hits are WR lunarDmgNode → Pando customDmg (no lunar transDef).
 *
 *   nx test gi-pando-parity -- nefer.spec.ts
 */
import { expect } from 'vitest'
import {
  assertFinals,
  assertPandoListingsFinite,
  buildPando,
  buildWrSolo,
  type ParityFixture,
  pandoListingNames,
} from './harness'

const FIXTURE: ParityFixture = {
  members: [
    {
      char: {
        key: 'Nefer',
        level: 80,
        talent: { auto: 8, skill: 8, burst: 8 },
        ascension: 6,
        constellation: 6,
      },
      weapon: {
        key: 'FavoniusCodex',
        level: 90,
        ascension: 6,
        refinement: 1,
        location: 'Nefer',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a0_lunarbloom_baseDmg_',
  'a1VeilStacks_eleMas',
  'burst_hit1',
  'burst_hit2',
  'c6',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_nefer1Dmg',
  'skill_nefer2Dmg',
  'skill_shade1Dmg',
  'skill_shade2Dmg',
  'skill_shade3Dmg',
  'skill_skillDmg',
]

function withConds(
  a1VeilStacks: number,
  burstVeilsAbsorbed: number,
  c4ShadowDance: boolean
): ParityFixture {
  const wrNefer: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (a1VeilStacks) {
    wrNefer.a1VeilStacks = String(a1VeilStacks)
    pandoConditionals.push({
      sheet: 'Nefer',
      src: '0',
      dst: null,
      name: 'a1VeilStacks',
      value: a1VeilStacks,
    })
  }
  if (burstVeilsAbsorbed) {
    wrNefer.burstVeilsAbsorbed = String(burstVeilsAbsorbed)
    pandoConditionals.push({
      sheet: 'Nefer',
      src: '0',
      dst: null,
      name: 'burstVeilsAbsorbed',
      value: burstVeilsAbsorbed,
    })
  }
  if (c4ShadowDance) {
    wrNefer.c4ShadowDance = 'on'
    pandoConditionals.push({
      sheet: 'Nefer',
      src: '0',
      dst: null,
      name: 'c4ShadowDance',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Nefer: wrNefer },
    pandoConditionals,
  }
}

describe('Nefer WR ↔ Pando finals', () => {
  test.each([
    [0, 0, false],
    [3, 0, false],
    [5, 0, false],
    [0, 3, false],
    [0, 5, false],
    [0, 0, true],
    [5, 5, true],
  ] as const)('aligned finals (a1VeilStacks=%s burstVeilsAbsorbed=%s c4ShadowDance=%s)', (a1VeilStacks, burstVeilsAbsorbed, c4ShadowDance) => {
    const fixture =
      a1VeilStacks || burstVeilsAbsorbed || c4ShadowDance
        ? withConds(a1VeilStacks, burstVeilsAbsorbed, c4ShadowDance)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )
  })
})
