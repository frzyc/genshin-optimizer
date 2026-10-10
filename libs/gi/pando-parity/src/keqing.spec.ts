/**
 * Keqing WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * List conds `afterRecast` / `afterBurst` / `afterReact` — Pando `value: 1` ↔ WR
 * state string (not `'on'`). Num `c6Stack` 0–4 ↔ WR `'1'`…`'4'`. C3 burst / C5
 * skill. A1 electro infusion is listing-local. A4 critRate_ + enerRech_ and C4
 * atk_ are ownBuff.
 *
 *   nx test gi-pando-parity -- keqing.spec.ts
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
        key: 'Keqing',
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
        location: 'Keqing',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst_final',
  'burst_initial',
  'burst_slash',
  'c1',
  'charged_1',
  'charged_2',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'normal_5',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_slash',
  'skill_stiletto',
  'skill_thunderclap',
]

function withConds(
  afterRecast: boolean,
  afterBurst: boolean,
  afterReact: boolean,
  c6Stack: number
): ParityFixture {
  const wrKeqing: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (afterRecast) {
    wrKeqing.afterRecast = 'afterRecast'
    pandoConditionals.push({
      sheet: 'Keqing',
      src: '0',
      dst: null,
      name: 'afterRecast',
      value: 1,
    })
  }
  if (afterBurst) {
    wrKeqing.afterBurst = 'afterBurst'
    pandoConditionals.push({
      sheet: 'Keqing',
      src: '0',
      dst: null,
      name: 'afterBurst',
      value: 1,
    })
  }
  if (afterReact) {
    wrKeqing.afterReact = 'afterReact'
    pandoConditionals.push({
      sheet: 'Keqing',
      src: '0',
      dst: null,
      name: 'afterReact',
      value: 1,
    })
  }
  if (c6Stack > 0) {
    wrKeqing.c6Stack = String(c6Stack)
    pandoConditionals.push({
      sheet: 'Keqing',
      src: '0',
      dst: null,
      name: 'c6Stack',
      value: c6Stack,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Keqing: wrKeqing },
    pandoConditionals,
  }
}

describe('Keqing WR ↔ Pando finals', () => {
  test.each([
    [false, false, false, 0],
    [true, false, false, 0],
    [false, true, false, 0],
    [false, false, true, 0],
    [true, true, true, 4],
  ] as const)('aligned finals (recast=%s burst=%s react=%s c6=%s)', (afterRecast, afterBurst, afterReact, c6Stack) => {
    const fixture =
      afterRecast || afterBurst || afterReact || c6Stack
        ? withConds(afterRecast, afterBurst, afterReact, c6Stack)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (afterBurst) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.critRate_).val as number).toBeGreaterThan(
        off.compute(own.final.critRate_).val as number
      )
    }
    if (afterReact) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.atk).val as number).toBeGreaterThan(
        off.compute(own.final.atk).val as number
      )
    }
  })
})
