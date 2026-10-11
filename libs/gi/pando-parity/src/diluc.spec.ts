/**
 * Diluc WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Num cond `DilucC2`: Pando 0–max ↔ WR `'1'`…`'N'`. Burst / DilucC1 / DilucC6
 * are bool `'on'`. C3 boosts skill; C5 burst. Burst pyro infusion is listing-local.
 * C2 atk_ is ownBuff.
 *
 *   nx test gi-pando-parity -- diluc.spec.ts
 */
import { own } from '@genshin-optimizer/gi/formula'
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
        key: 'Diluc',
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
        location: 'Diluc',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst_dot',
  'burst_explosion',
  'burst_slash',
  'c4_second',
  'c4_third',
  'charged_final',
  'charged_spin',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_first',
  'skill_second',
  'skill_third',
]

function withConds(
  Burst: boolean,
  DilucC1: boolean,
  DilucC2: number,
  DilucC6: boolean
): ParityFixture {
  const wrDiluc: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (Burst) {
    wrDiluc.Burst = 'on'
    pandoConditionals.push({
      sheet: 'Diluc',
      src: '0',
      dst: null,
      name: 'Burst',
      value: 1,
    })
  }
  if (DilucC1) {
    wrDiluc.DilucC1 = 'on'
    pandoConditionals.push({
      sheet: 'Diluc',
      src: '0',
      dst: null,
      name: 'DilucC1',
      value: 1,
    })
  }
  if (DilucC2 > 0) {
    wrDiluc.DilucC2 = String(DilucC2)
    pandoConditionals.push({
      sheet: 'Diluc',
      src: '0',
      dst: null,
      name: 'DilucC2',
      value: DilucC2,
    })
  }
  if (DilucC6) {
    wrDiluc.DilucC6 = 'on'
    pandoConditionals.push({
      sheet: 'Diluc',
      src: '0',
      dst: null,
      name: 'DilucC6',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Diluc: wrDiluc },
    pandoConditionals,
  }
}

describe('Diluc WR ↔ Pando finals', () => {
  test.each([
    [false, false, 0, false],
    [true, false, 0, false],
    [false, true, 0, false],
    [false, false, 3, false],
    [true, true, 3, true],
  ] as const)('aligned finals (Burst=%s C1=%s C2=%s C6=%s)', (Burst, DilucC1, DilucC2, DilucC6) => {
    const fixture =
      Burst || DilucC1 || DilucC2 || DilucC6
        ? withConds(Burst, DilucC1, DilucC2, DilucC6)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (DilucC2) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.atk).val as number).toBeGreaterThan(
        off.compute(own.final.atk).val as number
      )
    }
  })
})
