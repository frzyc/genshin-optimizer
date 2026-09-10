/**
 * Ifa WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * List conds (`allListConditionals`): Pando fixture `value` is the 1-based index
 * into the list (0 = unset). WR uses the state string. Example:
 *   `['10','20',…,'200']` → Pando `value: 15` ↔ WR `'150'`
 *
 * A1 a1Essentials is whole-team teamBuff reaction dmg_ (not dest-gated).
 * Reaction dmg_ is not in DEFAULT_FINALS. A4/C4 are ownBuff eleMas.
 *
 *   nx test gi-pando-parity -- ifa.spec.ts
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
        key: 'Ifa',
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
        location: 'Ifa',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

/** WR `'150'` — 1-based index into range(10, 200, 10).map(String). */
const A1_ESSENTIALS_150_LIST_INDEX = 15

const EXPECTED_LISTINGS = [
  'burst',
  'burst_cryo',
  'burst_electro',
  'burst_hydro',
  'burst_pyro',
  'c6',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_tonicDmg',
  'skill_tonicHeal',
]

function withConds(
  a1Essentials: boolean,
  a4NsBurst: boolean,
  c4AfterBurst: boolean
): ParityFixture {
  const wrIfa: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (a1Essentials) {
    wrIfa.a1Essentials = '150'
    pandoConditionals.push({
      sheet: 'Ifa',
      src: '0',
      dst: null,
      name: 'a1Essentials',
      value: A1_ESSENTIALS_150_LIST_INDEX,
    })
  }
  if (a4NsBurst) {
    wrIfa.a4NsBurst = 'on'
    pandoConditionals.push({
      sheet: 'Ifa',
      src: '0',
      dst: null,
      name: 'a4NsBurst',
      value: 1,
    })
  }
  if (c4AfterBurst) {
    wrIfa.c4AfterBurst = 'on'
    pandoConditionals.push({
      sheet: 'Ifa',
      src: '0',
      dst: null,
      name: 'c4AfterBurst',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Ifa: wrIfa },
    pandoConditionals,
  }
}

describe('Ifa WR ↔ Pando finals', () => {
  test.each([
    [false, false, false],
    [true, false, false],
    [false, true, false],
    [false, false, true],
    [true, true, true],
  ] as const)('aligned finals (a1Essentials=%s a4NsBurst=%s c4AfterBurst=%s)', (a1Essentials, a4NsBurst, c4AfterBurst) => {
    const fixture =
      a1Essentials || a4NsBurst || c4AfterBurst
        ? withConds(a1Essentials, a4NsBurst, c4AfterBurst)
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
