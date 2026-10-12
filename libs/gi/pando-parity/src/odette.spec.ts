/**
 * Odette WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bools `burst` / `c2NearOpponent` `'on'`. List `a0StellarRadiance` `'sc'`|`'ss'`
 * (Pando 1-based). Num `a1TeamSplendor` 0–6 (C1 unlocks 5–6). C3 skill / C5 burst.
 * A0 stellar base dmg_ is teamBuff (not in DEFAULT_FINALS). C2 self atk_ is
 * ownBuff. Team atk_ / A1 / C4 / C6 team stellar are notOwnBuff. Skip `atk`
 * when splendor is on (teamBuff/notOwnBuff vs solo WR UIData).
 *
 *   nx test gi-pando-parity -- odette.spec.ts
 */
import { expect } from 'vitest'
import {
  assertFinals,
  assertPandoListingsFinite,
  buildPando,
  buildWrSolo,
  DEFAULT_FINALS,
  type ParityFixture,
  pandoListingNames,
} from './harness'

const FIXTURE: ParityFixture = {
  members: [
    {
      char: {
        key: 'Odette',
        level: 80,
        talent: { auto: 8, skill: 8, burst: 8 },
        ascension: 6,
        constellation: 6,
      },
      weapon: {
        key: 'FavoniusSword',
        level: 90,
        ascension: 6,
        refinement: 1,
        location: 'Odette',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a0_stellarconduct_baseDmg_',
  'a0_stellarswirl_baseDmg_',
  'a4_stellar_mult_',
  'burst_finalDmg',
  'burst_slashDmg',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'normal_5',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
  'skill_codaDotDmg',
  'skill_plumeDmg',
  'skill_wingDmg',
]

const STELLAR_DEFAULT_OR_SC_LISTINGS = [
  'c1_stellarconduct_dmg',
  'c4_stellarconduct_dmg',
  'skill_codaStellarconductDmg',
]

const STELLAR_SC_ONLY_LISTINGS = [
  'skill_plumeStellarconductDmg',
  'skill_wingStellarconductDmg',
]

const STELLAR_SS_LISTINGS = [
  'c1_stellarswirl_dmg',
  'c4_stellarswirl_dmg',
  'skill_codaStellarswirlDmg',
  'skill_plumeStellarswirlDmg',
  'skill_wingStellarswirlDmg',
]

type OdetteConds = {
  burst?: boolean
  a1TeamSplendor?: number
  a0StellarRadiance?: 'sc' | 'ss'
  c2NearOpponent?: boolean
}

function withConds(conds: OdetteConds): ParityFixture {
  const wrOdette: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (conds.burst) {
    wrOdette.burst = 'on'
    pandoConditionals.push({
      sheet: 'Odette',
      src: '0',
      dst: null,
      name: 'burst',
      value: 1,
    })
  }
  if (conds.a1TeamSplendor) {
    wrOdette.a1TeamSplendor = String(conds.a1TeamSplendor)
    pandoConditionals.push({
      sheet: 'Odette',
      src: '0',
      dst: null,
      name: 'a1TeamSplendor',
      value: conds.a1TeamSplendor,
    })
  }
  if (conds.a0StellarRadiance) {
    wrOdette.a0StellarRadiance = conds.a0StellarRadiance
    pandoConditionals.push({
      sheet: 'Odette',
      src: '0',
      dst: null,
      name: 'a0StellarRadiance',
      value: conds.a0StellarRadiance === 'sc' ? 1 : 2,
    })
  }
  if (conds.c2NearOpponent) {
    wrOdette.c2NearOpponent = 'on'
    pandoConditionals.push({
      sheet: 'Odette',
      src: '0',
      dst: null,
      name: 'c2NearOpponent',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Odette: wrOdette },
    pandoConditionals,
  }
}

describe('Odette WR ↔ Pando finals', () => {
  test.each([
    [{}],
    [{ burst: true }],
    [{ a1TeamSplendor: 6 }],
    [{ a0StellarRadiance: 'sc' as const, c2NearOpponent: true }],
    [{ a0StellarRadiance: 'ss' as const, c2NearOpponent: true }],
    [
      {
        burst: true,
        a1TeamSplendor: 6,
        a0StellarRadiance: 'sc' as const,
        c2NearOpponent: true,
      },
    ],
  ] as const)('aligned finals %j', (conds) => {
    const fixture = Object.keys(conds).length ? withConds(conds) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    // C2 self atk_ is ownBuff; skip `atk` when splendor is on so notOwnBuff
    // team atk_ cannot trip solo WR UIData (teamBuff hidden).
    assertFinals(
      wr,
      pando,
      conds.a1TeamSplendor
        ? DEFAULT_FINALS.filter((s) => s !== 'atk')
        : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (conds.a0StellarRadiance === 'ss') {
      expect(pandoListingNames(pando)).toEqual(
        expect.arrayContaining(STELLAR_SS_LISTINGS)
      )
    } else {
      expect(pandoListingNames(pando)).toEqual(
        expect.arrayContaining(STELLAR_DEFAULT_OR_SC_LISTINGS)
      )
    }
    if (conds.a0StellarRadiance === 'sc') {
      expect(pandoListingNames(pando)).toEqual(
        expect.arrayContaining(STELLAR_SC_ONLY_LISTINGS)
      )
    }
  })
})
