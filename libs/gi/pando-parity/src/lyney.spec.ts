/**
 * Lyney WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 * C3 auto / C5 burst. A4 all_dmg_ is own premod (in DEFAULT_FINALS? no).
 * C2 critDMG_ is own — include in finals.
 *
 *   nx test gi-pando-parity -- lyney.spec.ts
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
        key: 'Lyney',
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
        location: 'Lyney',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'burst_firework',
  'c6',
  'charged_aimed',
  'charged_fullyAimed',
  'charged_prop',
  'charged_pyrotechnic',
  'charged_spiritbreath',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
  'skill_hpRegen',
]

function withConds(
  propStacks: number,
  a4: boolean,
  c2Stacks: number
): ParityFixture {
  const wrLyney: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (propStacks) {
    wrLyney.propStacks = String(propStacks)
    pandoConditionals.push({
      sheet: 'Lyney',
      src: '0',
      dst: null,
      name: 'propStacks',
      value: propStacks,
    })
  }
  if (a4) {
    wrLyney.a4AffectedByPyro = 'on'
    pandoConditionals.push({
      sheet: 'Lyney',
      src: '0',
      dst: null,
      name: 'a4AffectedByPyro',
      value: 1,
    })
  }
  if (c2Stacks) {
    wrLyney.c2Stacks = String(c2Stacks)
    pandoConditionals.push({
      sheet: 'Lyney',
      src: '0',
      dst: null,
      name: 'c2Stacks',
      value: c2Stacks,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Lyney: wrLyney },
    pandoConditionals,
  }
}

describe('Lyney WR ↔ Pando finals', () => {
  test.each([
    [0, false, 0],
    [5, true, 3],
  ] as const)('aligned finals (prop=%s a4=%s c2=%s)', (prop, a4, c2) => {
    const fixture = prop || a4 || c2 ? withConds(prop, a4, c2) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )
  })
})
