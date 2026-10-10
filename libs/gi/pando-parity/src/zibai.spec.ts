/**
 * Zibai WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bool `a1Moonfall` / `c1FirstStride` / `c2ShiftMode` / `c4Splendor`.
 * WR `lookup` c6Point (states `'1'`..`'30'`) → Pando `allNumConditionals`
 * 0–30. Fixture: WR string key ↔ Pando integer.
 *
 * A0 / C2 team lunarcrystallize_dmg_ are teamBuff (not in DEFAULT_FINALS).
 * C6 specialDmg_ is ownBuff dmg_.lunarcrystallize. A1 / C1 / C4 are
 * listing-local. A4 hydro EM is 0 on solo. WR solo `tally.geo` is 0 (teamBuff
 * tally is not applied in computeUIData) so A4 `geo-1` is −15% DEF; Pando
 * `count.geo` includes self → A4 is 0. Skip `def` in solo finals. C3 skill /
 * C5 burst.
 * Lunar hits are WR lunarDmgNode → Pando customDmg (no lunar ×3 / transDef).
 *
 *   nx test gi-pando-parity -- zibai.spec.ts
 */
import { own } from '@genshin-optimizer/gi/formula'
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
        key: 'Zibai',
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
        location: 'Zibai',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a0_lunarcrystallize_baseDmg_',
  'a1Moonfall_stride_dmgInc',
  'burst_skill1Dmg',
  'burst_skill2Dmg',
  'c2Moonfall_stride_dmgInc',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_shift1Dmg',
  'skill_shift2Dmg',
  'skill_shift3Dmg',
  'skill_shift4Dmg',
  'skill_shift4GleamDmg',
  'skill_shiftCaDmg',
  'skill_stride1Dmg',
  'skill_stride2Dmg',
]

type ZibaiConds = {
  a1Moonfall?: boolean
  c1FirstStride?: boolean
  c2ShiftMode?: boolean
  c4Splendor?: boolean
  c6Point?: number
}

function withConds(conds: ZibaiConds): ParityFixture {
  const wrZibai: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (conds.a1Moonfall) {
    wrZibai.a1Moonfall = 'on'
    pandoConditionals.push({
      sheet: 'Zibai',
      src: '0',
      dst: null,
      name: 'a1Moonfall',
      value: 1,
    })
  }
  if (conds.c1FirstStride) {
    wrZibai.c1FirstStride = 'on'
    pandoConditionals.push({
      sheet: 'Zibai',
      src: '0',
      dst: null,
      name: 'c1FirstStride',
      value: 1,
    })
  }
  if (conds.c2ShiftMode) {
    wrZibai.c2ShiftMode = 'on'
    pandoConditionals.push({
      sheet: 'Zibai',
      src: '0',
      dst: null,
      name: 'c2ShiftMode',
      value: 1,
    })
  }
  if (conds.c4Splendor) {
    wrZibai.c4Splendor = 'on'
    pandoConditionals.push({
      sheet: 'Zibai',
      src: '0',
      dst: null,
      name: 'c4Splendor',
      value: 1,
    })
  }
  if (conds.c6Point) {
    wrZibai.c6Point = String(conds.c6Point)
    pandoConditionals.push({
      sheet: 'Zibai',
      src: '0',
      dst: null,
      name: 'c6Point',
      value: conds.c6Point,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Zibai: wrZibai },
    pandoConditionals,
  }
}

describe('Zibai WR ↔ Pando finals', () => {
  test.each([
    [{}],
    [{ a1Moonfall: true }],
    [{ c1FirstStride: true }],
    [{ c2ShiftMode: true }],
    [{ c4Splendor: true }],
    [{ c6Point: 30 }],
    [
      {
        a1Moonfall: true,
        c1FirstStride: true,
        c2ShiftMode: true,
        c4Splendor: true,
        c6Point: 30,
      },
    ],
  ] as const)('aligned finals %j', (conds) => {
    const fixture = Object.keys(conds).length ? withConds(conds) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(
      wr,
      pando,
      DEFAULT_FINALS.filter((s) => s !== 'def')
    )
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    const off = buildPando(FIXTURE)
    const extraLc =
      (conds.c2ShiftMode ? 0.3 : 0) +
      (conds.c6Point ? 0.016 * conds.c6Point : 0)
    expect(
      pando.compute(own.premod.dmg_.lunarcrystallize).val as number
    ).toBeCloseTo(
      (off.compute(own.premod.dmg_.lunarcrystallize).val as number) + extraLc
    )
  })
})
