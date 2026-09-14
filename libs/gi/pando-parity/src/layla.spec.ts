/**
 * Layla WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Num cond `a1Stacks`: Pando 0–4 ↔ WR lookup keys `'1'`…`'4'`.
 * c4Active is bool `'on'`.
 *
 * A1 shield_ is dest-gated teamBuff; C4 NA/CA dmgInc is whole-team teamBuff.
 * Solo computeUIData does not apply WR teamBuff; those are not in DEFAULT_FINALS.
 *
 *   nx test gi-pando-parity -- layla.spec.ts
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
        key: 'Layla',
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
        location: 'Layla',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'c1PartyCryoShield',
  'c1PartyShield',
  'charged_1',
  'charged_2',
  'normal_0',
  'normal_1',
  'normal_2',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skillCryoShield',
  'skillDmg',
  'skillShield',
  'slugDmg',
  'starDmg',
]

function withConds(a1Stacks: number, c4Active: boolean): ParityFixture {
  const wrLayla: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (a1Stacks > 0) {
    wrLayla.a1Stacks = String(a1Stacks)
    pandoConditionals.push({
      sheet: 'Layla',
      src: '0',
      dst: null,
      name: 'a1Stacks',
      value: a1Stacks,
    })
  }
  if (c4Active) {
    wrLayla.c4Active = 'on'
    pandoConditionals.push({
      sheet: 'Layla',
      src: '0',
      dst: null,
      name: 'c4Active',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Layla: wrLayla },
    pandoConditionals,
  }
}

describe('Layla WR ↔ Pando finals', () => {
  test.each([
    [0, false],
    [4, false],
    [0, true],
    [4, true],
  ] as const)('aligned finals (a1Stacks=%s c4Active=%s)', (a1Stacks, c4Active) => {
    const fixture =
      a1Stacks || c4Active ? withConds(a1Stacks, c4Active) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )
  })
})
