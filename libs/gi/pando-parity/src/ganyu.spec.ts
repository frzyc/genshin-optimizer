/**
 * Ganyu WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Num cond `C4`: Pando 0–5 ↔ WR lookup keys `'1'`…`'5'`.
 * A1 / A4 / C1 are bool `'on'`. A4 dest-gated cryo_dmg_ and C4 all_dmg_ are
 * teamBuff — not in DEFAULT_FINALS. A1 frostflake critRate_ is listing-local.
 *
 *   nx test gi-pando-parity -- ganyu.spec.ts
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
        key: 'Ganyu',
        level: 80,
        talent: { auto: 8, skill: 8, burst: 8 },
        ascension: 6,
        constellation: 6,
      },
      weapon: {
        key: 'FavoniusWarbow',
        level: 90,
        ascension: 6,
        refinement: 1,
        location: 'Ganyu',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'charged_aimed',
  'charged_aimedCharged',
  'charged_frostflake',
  'charged_frostflakeBloom',
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
]

function withConds(
  A1: boolean,
  A4: boolean,
  C1: boolean,
  C4: number
): ParityFixture {
  const wrGanyu: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (A1) {
    wrGanyu.A1 = 'on'
    pandoConditionals.push({
      sheet: 'Ganyu',
      src: '0',
      dst: null,
      name: 'A1',
      value: 1,
    })
  }
  if (A4) {
    wrGanyu.A4 = 'on'
    pandoConditionals.push({
      sheet: 'Ganyu',
      src: '0',
      dst: null,
      name: 'A4',
      value: 1,
    })
  }
  if (C1) {
    wrGanyu.C1 = 'on'
    pandoConditionals.push({
      sheet: 'Ganyu',
      src: '0',
      dst: null,
      name: 'C1',
      value: 1,
    })
  }
  if (C4 > 0) {
    wrGanyu.C4 = String(C4)
    pandoConditionals.push({
      sheet: 'Ganyu',
      src: '0',
      dst: null,
      name: 'C4',
      value: C4,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Ganyu: wrGanyu },
    pandoConditionals,
  }
}

describe('Ganyu WR ↔ Pando finals', () => {
  test.each([
    [false, false, false, 0],
    [true, false, false, 0],
    [false, true, false, 0],
    [false, false, true, 0],
    [false, false, false, 5],
    [true, true, true, 5],
  ] as const)('aligned finals (A1=%s A4=%s C1=%s C4=%s)', (A1, A4, C1, C4) => {
    const fixture = A1 || A4 || C1 || C4 ? withConds(A1, A4, C1, C4) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )
  })
})
