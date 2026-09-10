/**
 * Mualani WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * List cond `a4Stacks`: Pando `value` is 1-based index into `['1','2','3']`.
 * C3 skill / C5 burst. No teamBuff.
 *
 *   nx test gi-pando-parity -- mualani.spec.ts
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
        key: 'Mualani',
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
        location: 'Mualani',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'c1',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_basicDmg',
  'skill_stack1Dmg',
  'skill_stack2Dmg',
  'skill_surgingDmg',
]

const A4_STACKS3_LIST_INDEX = 3

function withConds(a4Stacks3: boolean): ParityFixture {
  if (!a4Stacks3) return FIXTURE
  return {
    ...FIXTURE,
    wrConditionals: { Mualani: { a4Stacks: '3' } },
    pandoConditionals: [
      {
        sheet: 'Mualani',
        src: '0',
        dst: null,
        name: 'a4Stacks',
        value: A4_STACKS3_LIST_INDEX,
      },
    ],
  }
}

describe('Mualani WR ↔ Pando finals', () => {
  test.each([false, true])('aligned finals (a4Stacks3=%s)', (a4Stacks3) => {
    const fixture = withConds(a4Stacks3)
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )
  })
})
