/**
 * Freminet WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Num cond `c4C6Stacks`: Pando 0–3 ↔ WR lookup keys `'1'`…`'3'` (C6 maxStacks).
 * stalk / a4AfterShatter are bool `'on'`.
 *
 *   nx test gi-pando-parity -- freminet.spec.ts
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
        key: 'Freminet',
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
        location: 'Freminet',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'charged_final',
  'charged_spin',
  'frostDmg',
  'level0Dmg',
  'level1CryoDmg',
  'level1PhysDmg',
  'level2CryoDmg',
  'level2PhysDmg',
  'level3CryoDmg',
  'level3PhysDmg',
  'level4Dmg',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'thornDmg',
  'thrustDmg',
]

function withConds(
  stalk: boolean,
  a4AfterShatter: boolean,
  c4C6Stacks: number
): ParityFixture {
  const wrFreminet: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (stalk) {
    wrFreminet.stalk = 'on'
    pandoConditionals.push({
      sheet: 'Freminet',
      src: '0',
      dst: null,
      name: 'stalk',
      value: 1,
    })
  }
  if (a4AfterShatter) {
    wrFreminet.a4AfterShatter = 'on'
    pandoConditionals.push({
      sheet: 'Freminet',
      src: '0',
      dst: null,
      name: 'a4AfterShatter',
      value: 1,
    })
  }
  if (c4C6Stacks > 0) {
    wrFreminet.c4C6Stacks = String(c4C6Stacks)
    pandoConditionals.push({
      sheet: 'Freminet',
      src: '0',
      dst: null,
      name: 'c4C6Stacks',
      value: c4C6Stacks,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Freminet: wrFreminet },
    pandoConditionals,
  }
}

describe('Freminet WR ↔ Pando finals', () => {
  test.each([
    [false, false, 0],
    [true, false, 0],
    [false, true, 0],
    [false, false, 3],
    [true, true, 3],
  ] as const)('aligned finals (stalk=%s a4AfterShatter=%s c4C6Stacks=%s)', (stalk, a4AfterShatter, c4C6Stacks) => {
    const fixture =
      stalk || a4AfterShatter || c4C6Stacks
        ? withConds(stalk, a4AfterShatter, c4C6Stacks)
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
