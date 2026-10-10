/**
 * Charlotte WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * List cond `c2Hit`: Pando `value` is 1-based index into `['1','2','3']`.
 * c4Marked is bool `'on'`.
 *
 *   nx test gi-pando-parity -- charlotte.spec.ts
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
        key: 'Charlotte',
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
        location: 'Charlotte',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burstDmg',
  'c1Heal',
  'c6Dmg',
  'c6Heal',
  'castHeal',
  'charged',
  'focusMarkDmg',
  'kameraDmg',
  'kameraHeal',
  'normal_0',
  'normal_1',
  'normal_2',
  'photoHoldDmg',
  'photoPressDmg',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'snapMarkDmg',
  'thornDmg',
]

const C2_HIT3_LIST_INDEX = 3

function withConds(c2Hit3: boolean, c4Marked: boolean): ParityFixture {
  const wrCharlotte: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (c2Hit3) {
    wrCharlotte.c2Hit = '3'
    pandoConditionals.push({
      sheet: 'Charlotte',
      src: '0',
      dst: null,
      name: 'c2Hit',
      value: C2_HIT3_LIST_INDEX,
    })
  }
  if (c4Marked) {
    wrCharlotte.c4Marked = 'on'
    pandoConditionals.push({
      sheet: 'Charlotte',
      src: '0',
      dst: null,
      name: 'c4Marked',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Charlotte: wrCharlotte },
    pandoConditionals,
  }
}

describe('Charlotte WR ↔ Pando finals', () => {
  test.each([
    [false, false],
    [true, false],
    [false, true],
    [true, true],
  ] as const)('aligned finals (c2Hit3=%s c4Marked=%s)', (c2Hit3, c4Marked) => {
    const fixture = c2Hit3 || c4Marked ? withConds(c2Hit3, c4Marked) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )
  })
})
