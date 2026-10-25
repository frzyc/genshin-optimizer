/**
 * Sethos WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Num cond `c2Stacks`: Pando 0–2 ↔ WR lookup keys `'1'`…`'2'`.
 * a4Sandshade / c4Strike are bool `'on'`. C3 boosts auto; C5 burst.
 * C4 teamBuff eleMas is hidden in solo WR UIData — skip `eleMas` when on.
 *
 *   nx test gi-pando-parity -- sethos.spec.ts
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
        key: 'Sethos',
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
        location: 'Sethos',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'charged_aimed',
  'charged_fullyAimed',
  'charged_shadow',
  'dusk_0',
  'dusk_1',
  'dusk_2',
  'dusk_3',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
]

function withConds(
  a4Sandshade: boolean,
  c2Stacks: number,
  c4Strike: boolean
): ParityFixture {
  const wrSethos: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (a4Sandshade) {
    wrSethos.a4Sandshade = 'on'
    pandoConditionals.push({
      sheet: 'Sethos',
      src: '0',
      dst: null,
      name: 'a4Sandshade',
      value: 1,
    })
  }
  if (c2Stacks > 0) {
    wrSethos.c2Stacks = String(c2Stacks)
    pandoConditionals.push({
      sheet: 'Sethos',
      src: '0',
      dst: null,
      name: 'c2Stacks',
      value: c2Stacks,
    })
  }
  if (c4Strike) {
    wrSethos.c4Strike = 'on'
    pandoConditionals.push({
      sheet: 'Sethos',
      src: '0',
      dst: null,
      name: 'c4Strike',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Sethos: wrSethos },
    pandoConditionals,
  }
}

describe('Sethos WR ↔ Pando finals', () => {
  test.each([
    [false, 0, false],
    [true, 0, false],
    [false, 2, false],
    [false, 0, true],
    [true, 2, true],
  ] as const)('aligned finals (a4Sandshade=%s c2Stacks=%s c4Strike=%s)', (a4Sandshade, c2Stacks, c4Strike) => {
    const fixture =
      a4Sandshade || c2Stacks || c4Strike
        ? withConds(a4Sandshade, c2Stacks, c4Strike)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(
      wr,
      pando,
      c4Strike ? DEFAULT_FINALS.filter((s) => s !== 'eleMas') : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (c4Strike) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.eleMas).val as number).toBeGreaterThan(
        off.compute(own.final.eleMas).val as number
      )
    }
  })
})
