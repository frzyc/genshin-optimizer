/**
 * TravelerCryo WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * List `a0StellarRadiance` `'sc'`|`'ss'` (Pando 1-based). Num `burstFrostglow`
 * 0–maxFrostglow. Bools `a1ScStar` / `c2Crystal` / `c2ActiveStellar` `'on'`
 * (`a1ScStar` needs sc; `c2ActiveStellar` needs `c2Crystal`).
 * `lockedPassive` / `bonusCanned` / `bonusSkirk*` are WR `cond('Traveler', …)`
 * registered on this key. traveler{ele} stay on sheet `Traveler`.
 *
 * C3 burst / C5 skill (WR skillBoost C5, burstBoost C3). Stellar hits are
 * talent-style listings (Odette/Sandrone). A0 baseDmg_ → teamBuff `dmg_`.
 * C2 destIsActive teamBuff eleMas — skip `eleMas` when on.
 *
 *   nx test gi-pando-parity -- travelercryo.spec.ts
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
        key: 'TravelerCryo',
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
        location: 'TravelerCryo',
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
  'a4_eleMas',
  'charged_1',
  'charged_2',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
  'skill_crystalDmg',
]

const UNSET_BURST_LISTINGS = ['burst_javelinDmg']
const SC_BURST_LISTINGS = ['burst_javelinStellarconductDmg']
const SS_BURST_LISTINGS = ['burst_javelinStellarswirlDmg']
const LOCKED_UNSET_LISTINGS = ['lockedPassive_dmg1', 'lockedPassive_dmg2']
const LOCKED_SC_LISTINGS = [
  'lockedPassive_stellarconductDmg1',
  'lockedPassive_stellarconductDmg2',
]
const LOCKED_SS_LISTINGS = [
  'lockedPassive_stellarswirlDmg1',
  'lockedPassive_stellarswirlDmg2',
]

type TravelerCryoConds = {
  a0StellarRadiance?: 'sc' | 'ss'
  burstFrostglow?: number
  a1ScStar?: boolean
  c2Crystal?: boolean
  c2ActiveStellar?: boolean
  lockedPassive?: boolean
  bonusCanned?: boolean
  bonusSkirk1?: boolean
  travelercryo?: boolean
}

function withConds(conds: TravelerCryoConds): ParityFixture {
  const wrTraveler: Record<string, string | number> = {}
  const wrTravelerCryo: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (conds.a0StellarRadiance) {
    wrTravelerCryo.a0StellarRadiance = conds.a0StellarRadiance
    pandoConditionals.push({
      sheet: 'TravelerCryo',
      src: '0',
      dst: null,
      name: 'a0StellarRadiance',
      value: conds.a0StellarRadiance === 'sc' ? 1 : 2,
    })
  }
  if (conds.burstFrostglow) {
    wrTravelerCryo.burstFrostglow = String(conds.burstFrostglow)
    pandoConditionals.push({
      sheet: 'TravelerCryo',
      src: '0',
      dst: null,
      name: 'burstFrostglow',
      value: conds.burstFrostglow,
    })
  }
  if (conds.a1ScStar) {
    wrTravelerCryo.a1ScStar = 'on'
    pandoConditionals.push({
      sheet: 'TravelerCryo',
      src: '0',
      dst: null,
      name: 'a1ScStar',
      value: 1,
    })
  }
  if (conds.c2Crystal) {
    wrTravelerCryo.c2Crystal = 'on'
    pandoConditionals.push({
      sheet: 'TravelerCryo',
      src: '0',
      dst: null,
      name: 'c2Crystal',
      value: 1,
    })
  }
  if (conds.c2ActiveStellar) {
    wrTravelerCryo.c2ActiveStellar = 'on'
    pandoConditionals.push({
      sheet: 'TravelerCryo',
      src: '0',
      dst: null,
      name: 'c2ActiveStellar',
      value: 1,
    })
  }
  if (conds.lockedPassive) {
    wrTraveler.lockedPassive = 'on'
    pandoConditionals.push({
      sheet: 'TravelerCryo',
      src: '0',
      dst: null,
      name: 'lockedPassive',
      value: 1,
    })
  }
  if (conds.bonusCanned) {
    wrTraveler.bonusCanned = 'on'
    pandoConditionals.push({
      sheet: 'TravelerCryo',
      src: '0',
      dst: null,
      name: 'bonusCanned',
      value: 1,
    })
  }
  if (conds.bonusSkirk1) {
    wrTraveler.bonusSkirk1 = 'on'
    pandoConditionals.push({
      sheet: 'TravelerCryo',
      src: '0',
      dst: null,
      name: 'bonusSkirk1',
      value: 1,
    })
  }
  if (conds.travelercryo) {
    wrTraveler.travelercryo = 'on'
    pandoConditionals.push({
      sheet: 'Traveler',
      src: '0',
      dst: null,
      name: 'travelercryo',
      value: 1,
    })
  }
  const wrConditionals: NonNullable<ParityFixture['wrConditionals']> = {}
  if (Object.keys(wrTraveler).length) wrConditionals.Traveler = wrTraveler
  if (Object.keys(wrTravelerCryo).length)
    wrConditionals.TravelerCryo = wrTravelerCryo
  return {
    ...FIXTURE,
    wrConditionals,
    pandoConditionals,
  }
}

describe('TravelerCryo WR ↔ Pando finals', () => {
  test.each([
    [{}],
    [{ a0StellarRadiance: 'sc' as const }],
    [{ a0StellarRadiance: 'ss' as const }],
    [{ burstFrostglow: 8 }],
    [{ a0StellarRadiance: 'sc' as const, a1ScStar: true }],
    [{ c2Crystal: true }],
    [{ c2Crystal: true, c2ActiveStellar: true }],
    [{ lockedPassive: true }],
    [{ lockedPassive: true, a0StellarRadiance: 'sc' as const }],
    [{ lockedPassive: true, a0StellarRadiance: 'ss' as const }],
    [{ bonusCanned: true, bonusSkirk1: true }],
    [{ lockedPassive: true, travelercryo: true }],
    [
      {
        a0StellarRadiance: 'sc' as const,
        burstFrostglow: 8,
        a1ScStar: true,
        c2Crystal: true,
        c2ActiveStellar: true,
        lockedPassive: true,
        bonusCanned: true,
      },
    ],
  ] as const)('aligned finals %j', (conds) => {
    const fixture = Object.keys(conds).length ? withConds(conds) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(
      wr,
      pando,
      conds.c2Crystal
        ? DEFAULT_FINALS.filter((s) => s !== 'eleMas')
        : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)
    const names = pandoListingNames(pando)
    expect(names).toEqual(expect.arrayContaining(EXPECTED_LISTINGS))

    if (conds.a0StellarRadiance === 'ss') {
      expect(names).toEqual(expect.arrayContaining(SS_BURST_LISTINGS))
    } else if (conds.a0StellarRadiance === 'sc') {
      expect(names).toEqual(expect.arrayContaining(SC_BURST_LISTINGS))
    } else {
      expect(names).toEqual(expect.arrayContaining(UNSET_BURST_LISTINGS))
    }

    if (conds.lockedPassive && conds.a0StellarRadiance === 'ss') {
      expect(names).toEqual(expect.arrayContaining(LOCKED_SS_LISTINGS))
    } else if (conds.lockedPassive && conds.a0StellarRadiance === 'sc') {
      expect(names).toEqual(expect.arrayContaining(LOCKED_SC_LISTINGS))
    } else if (conds.lockedPassive) {
      expect(names).toEqual(expect.arrayContaining(LOCKED_UNSET_LISTINGS))
    }
  })
})
