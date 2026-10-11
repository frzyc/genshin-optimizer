/**
 * Bennett WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * List conds: `activeInArea` / `underHP` — Pando `value: 1` ↔ WR `'activeInArea'` /
 * `'underHP'` (not `'on'`). C3 boosts skill; C5 burst. C6 pyro infusion is
 * listing-local. Burst ATK is dest-gated teamBuff.total.atk — skip `atk` when on.
 *
 *   nx test gi-pando-parity -- bennett.spec.ts
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
        key: 'Bennett',
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
        location: 'Bennett',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'burst_regen',
  'c4',
  'charged_1',
  'charged_2',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_explosion',
  'skill_hold1_1',
  'skill_hold1_2',
  'skill_hold2_1',
  'skill_hold2_2',
  'skill_press',
]

function withConds(activeInArea: boolean, underHP: boolean): ParityFixture {
  const wrBennett: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (activeInArea) {
    wrBennett.activeInArea = 'activeInArea'
    pandoConditionals.push({
      sheet: 'Bennett',
      src: '0',
      dst: null,
      name: 'activeInArea',
      value: 1,
    })
  }
  if (underHP) {
    wrBennett.underHP = 'underHP'
    pandoConditionals.push({
      sheet: 'Bennett',
      src: '0',
      dst: null,
      name: 'underHP',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Bennett: wrBennett },
    pandoConditionals,
  }
}

describe('Bennett WR ↔ Pando finals', () => {
  test.each([
    [false, false],
    [true, false],
    [false, true],
    [true, true],
  ] as const)('aligned finals (activeInArea=%s underHP=%s)', (activeInArea, underHP) => {
    const fixture =
      activeInArea || underHP ? withConds(activeInArea, underHP) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(
      wr,
      pando,
      activeInArea ? DEFAULT_FINALS.filter((s) => s !== 'atk') : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (activeInArea) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.atk).val as number).toBeGreaterThan(
        off.compute(own.final.atk).val as number
      )
    }
  })
})
