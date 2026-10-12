/**
 * Alhaitham WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bools `withMirrors` / `excessMirror` are `'on'`. Num `debateStacks` 0–4 ↔ WR
 * `'1'`…`'4'`. Num `mirrorsConsumed` 0–3 ↔ WR `'0'`…`'3'` (0 is a real WR
 * lookup key; Pando 0 is off). C3 skill / C5 burst.
 *
 * C4 teamBuff eleMas is hidden in solo WR UIData — skip `eleMas` when on.
 * C4 dendro_dmg_ and C2 own eleMas / C6 crit are ownBuff. withMirrors dendro
 * infusion is listing-local (infusionPrio has no dendro).
 *
 *   nx test gi-pando-parity -- alhaitham.spec.ts
 */
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
        key: 'Alhaitham',
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
        location: 'Alhaitham',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst_instanceDmg',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_mirrorDmg1',
  'skill_rushDmg',
]

function withConds(
  withMirrors: boolean,
  debateStacks: number,
  mirrorsConsumed: number,
  excessMirror: boolean
): ParityFixture {
  const wrAlhaitham: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (withMirrors) {
    wrAlhaitham.withMirrors = 'on'
    pandoConditionals.push({
      sheet: 'Alhaitham',
      src: '0',
      dst: null,
      name: 'withMirrors',
      value: 1,
    })
  }
  if (debateStacks > 0) {
    wrAlhaitham.debateStacks = String(debateStacks)
    pandoConditionals.push({
      sheet: 'Alhaitham',
      src: '0',
      dst: null,
      name: 'debateStacks',
      value: debateStacks,
    })
  }
  if (mirrorsConsumed > 0) {
    wrAlhaitham.mirrorsConsumed = String(mirrorsConsumed)
    pandoConditionals.push({
      sheet: 'Alhaitham',
      src: '0',
      dst: null,
      name: 'mirrorsConsumed',
      value: mirrorsConsumed,
    })
  }
  if (excessMirror) {
    wrAlhaitham.excessMirror = 'on'
    pandoConditionals.push({
      sheet: 'Alhaitham',
      src: '0',
      dst: null,
      name: 'excessMirror',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Alhaitham: wrAlhaitham },
    pandoConditionals,
  }
}

describe('Alhaitham WR ↔ Pando finals', () => {
  test.each([
    [false, 0, 0, false],
    [true, 0, 0, false],
    [false, 4, 0, false],
    [false, 0, 3, false],
    [false, 0, 0, true],
    [true, 4, 3, true],
  ] as const)('aligned finals (withMirrors=%s debateStacks=%s mirrorsConsumed=%s excessMirror=%s)', (withMirrors, debateStacks, mirrorsConsumed, excessMirror) => {
    const fixture =
      withMirrors || debateStacks || mirrorsConsumed || excessMirror
        ? withConds(withMirrors, debateStacks, mirrorsConsumed, excessMirror)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    // WR teamBuff.eleMas is hidden in solo UIData; Pando applies it.
    assertFinals(
      wr,
      pando,
      mirrorsConsumed
        ? DEFAULT_FINALS.filter((s) => s !== 'eleMas')
        : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )
  })
})
