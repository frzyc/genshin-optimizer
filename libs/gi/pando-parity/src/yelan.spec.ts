/**
 * Yelan WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Num `a4Stacks` 0–14, `c4Stacks` 0–4. C3 burst / C5 skill.
 * A4 all_dmg_ is dest-gated teamBuff (not in DEFAULT_FINALS).
 * A1 hp_ reads unique-element tally (`eleCount`); WR solo `tally.ele` does
 * not match Pando `eleCount`, so skip `hp`. C4 hp_ is teamBuff — same skip.
 *
 *   nx test gi-pando-parity -- yelan.spec.ts
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
        key: 'Yelan',
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
        location: 'Yelan',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst_press',
  'burst_throw',
  'c2',
  'c6',
  'charged_aimed',
  'charged_aimedCharged',
  'charged_barb',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
]

function withConds(a4Stacks: number, c4Stacks: number): ParityFixture {
  const wrYelan: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (a4Stacks > 0) {
    wrYelan.a4Stacks = String(a4Stacks)
    pandoConditionals.push({
      sheet: 'Yelan',
      src: '0',
      dst: null,
      name: 'a4Stacks',
      value: a4Stacks,
    })
  }
  if (c4Stacks > 0) {
    wrYelan.c4Stacks = String(c4Stacks)
    pandoConditionals.push({
      sheet: 'Yelan',
      src: '0',
      dst: null,
      name: 'c4Stacks',
      value: c4Stacks,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Yelan: wrYelan },
    pandoConditionals,
  }
}

describe('Yelan WR ↔ Pando finals', () => {
  test.each([
    [0, 0],
    [14, 0],
    [0, 4],
    [14, 4],
  ] as const)('aligned finals (a4=%s c4=%s)', (a4Stacks, c4Stacks) => {
    const fixture =
      a4Stacks || c4Stacks ? withConds(a4Stacks, c4Stacks) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(
      wr,
      pando,
      DEFAULT_FINALS.filter((s) => s !== 'hp')
    )
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (c4Stacks) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.hp).val as number).toBeGreaterThan(
        off.compute(own.final.hp).val as number
      )
    }
  })
})
