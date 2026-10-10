/**
 * Mavuika WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * List `burstSpirit` `['100','110',…,'200']` — Pando `value` is 1-based
 * (WR `'200'` → 11). List `a4TimeSinceBurst` `['0',…,'19']` — WR `'0'` → 1.
 * Bools `a1NsBurst` / `c1GainSpirit` / `c2RingForm` / `c2FlameForm` are `'on'`.
 * C3 burst / C5 skill. Flamestrider pyro is listing-local (no WR infusion).
 * A4 / C4 all_dmg_ are dest-gated teamBuff (not in DEFAULT_FINALS). C2 ring
 * def shred is enemyDebuff (not DEFAULT_FINALS). C2 base ATK is ownBuff.
 *
 *   nx test gi-pando-parity -- mavuika.spec.ts
 */
import { own } from '@genshin-optimizer/gi/formula'
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
        key: 'Mavuika',
        level: 80,
        talent: { auto: 8, skill: 8, burst: 8 },
        ascension: 6,
        constellation: 6,
      },
      weapon: {
        key: 'FavoniusGreatsword',
        level: 90,
        ascension: 6,
        refinement: 1,
        location: 'Mavuika',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

/** WR `'200'` — 1-based index into range(100, 200, 10).map(String). */
const BURST_SPIRIT_200_LIST_INDEX = 11
/** WR `'0'` — 1-based index into range(0, 19).map(String). */
const A4_TIME_0_LIST_INDEX = 1

const EXPECTED_LISTINGS = [
  'burst',
  'c2FlameForm_burst_dmgInc',
  'c2FlameForm_charged_dmgInc',
  'c2FlameForm_normal_dmgInc',
  'c6_flamestriderDmg',
  'c6_ringDmg',
  'charged',
  'flameCharged_dmgInc',
  'flameNormal_dmgInc',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
  'skill_chargedCyclicDmg',
  'skill_chargedFinalDmg',
  'skill_normal_0',
  'skill_normal_1',
  'skill_normal_2',
  'skill_normal_3',
  'skill_normal_4',
  'skill_plungeDmg',
  'skill_radianceDmg',
  'skill_sprintDmg',
  'sunfell_dmgInc',
]

type MavuikaConds = {
  burstSpirit?: boolean
  a1NsBurst?: boolean
  a4TimeSinceBurst?: boolean
  c1GainSpirit?: boolean
  c2RingForm?: boolean
  c2FlameForm?: boolean
}

function withConds(conds: MavuikaConds): ParityFixture {
  const wrMavuika: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (conds.burstSpirit) {
    wrMavuika.burstSpirit = '200'
    pandoConditionals.push({
      sheet: 'Mavuika',
      src: '0',
      dst: null,
      name: 'burstSpirit',
      value: BURST_SPIRIT_200_LIST_INDEX,
    })
  }
  if (conds.a1NsBurst) {
    wrMavuika.a1NsBurst = 'on'
    pandoConditionals.push({
      sheet: 'Mavuika',
      src: '0',
      dst: null,
      name: 'a1NsBurst',
      value: 1,
    })
  }
  if (conds.a4TimeSinceBurst) {
    wrMavuika.a4TimeSinceBurst = '0'
    pandoConditionals.push({
      sheet: 'Mavuika',
      src: '0',
      dst: null,
      name: 'a4TimeSinceBurst',
      value: A4_TIME_0_LIST_INDEX,
    })
  }
  if (conds.c1GainSpirit) {
    wrMavuika.c1GainSpirit = 'on'
    pandoConditionals.push({
      sheet: 'Mavuika',
      src: '0',
      dst: null,
      name: 'c1GainSpirit',
      value: 1,
    })
  }
  if (conds.c2RingForm) {
    wrMavuika.c2RingForm = 'on'
    pandoConditionals.push({
      sheet: 'Mavuika',
      src: '0',
      dst: null,
      name: 'c2RingForm',
      value: 1,
    })
  }
  if (conds.c2FlameForm) {
    wrMavuika.c2FlameForm = 'on'
    pandoConditionals.push({
      sheet: 'Mavuika',
      src: '0',
      dst: null,
      name: 'c2FlameForm',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Mavuika: wrMavuika },
    pandoConditionals,
  }
}

describe('Mavuika WR ↔ Pando finals', () => {
  test.each([
    [{}],
    [{ a1NsBurst: true }],
    [{ c1GainSpirit: true }],
    [{ c2RingForm: true }],
    [{ c2FlameForm: true }],
    [{ burstSpirit: true }],
    [{ burstSpirit: true, a4TimeSinceBurst: true }],
    [
      {
        burstSpirit: true,
        a1NsBurst: true,
        a4TimeSinceBurst: true,
        c1GainSpirit: true,
        c2RingForm: true,
        c2FlameForm: true,
      },
    ],
  ] as const)('aligned finals %j', (conds) => {
    const fixture = Object.keys(conds).length ? withConds(conds) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    // A4/C4 teamBuff all_dmg_ and C2 ring enemyDefRed_ are not DEFAULT_FINALS.
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    const off = buildPando(FIXTURE)
    expect(pando.compute(own.premod.atk_).val as number).toBeCloseTo(
      (off.compute(own.premod.atk_).val as number) +
        (conds.a1NsBurst ? 0.3 : 0) +
        (conds.c1GainSpirit ? 0.4 : 0)
    )
    if (conds.c2RingForm || conds.c2FlameForm) {
      expect(pando.compute(own.final.atk).val as number).toBeGreaterThan(
        off.compute(own.final.atk).val as number
      )
    }
  })
})
