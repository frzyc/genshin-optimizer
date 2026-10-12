/**
 * Yanfei WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Num cond `p1Seals`: Pando 0–4 ↔ WR lookup keys `'1'`…`'4'`.
 * afterBurst / c2EnemyHp are bool `'on'`. C3 boosts skill; C5 burst.
 *
 *   nx test gi-pando-parity -- yanfei.spec.ts
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
        key: 'Yanfei',
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
        location: 'Yanfei',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a4',
  'burst',
  'c4_pyroShield',
  'c4_shield',
  'charged_0',
  'charged_1',
  'charged_2',
  'charged_3',
  'charged_4',
  'normal_0',
  'normal_1',
  'normal_2',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
]

function withConds(
  afterBurst: boolean,
  p1Seals: number,
  c2EnemyHp: boolean
): ParityFixture {
  const wrYanfei: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (afterBurst) {
    wrYanfei.afterBurst = 'on'
    pandoConditionals.push({
      sheet: 'Yanfei',
      src: '0',
      dst: null,
      name: 'afterBurst',
      value: 1,
    })
  }
  if (p1Seals > 0) {
    wrYanfei.p1Seals = String(p1Seals)
    pandoConditionals.push({
      sheet: 'Yanfei',
      src: '0',
      dst: null,
      name: 'p1Seals',
      value: p1Seals,
    })
  }
  if (c2EnemyHp) {
    wrYanfei.c2EnemyHp = 'on'
    pandoConditionals.push({
      sheet: 'Yanfei',
      src: '0',
      dst: null,
      name: 'c2EnemyHp',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Yanfei: wrYanfei },
    pandoConditionals,
  }
}

describe('Yanfei WR ↔ Pando finals', () => {
  test.each([
    [false, 0, false],
    [true, 0, false],
    [false, 4, false],
    [false, 0, true],
    [true, 4, true],
  ] as const)('aligned finals (afterBurst=%s p1Seals=%s c2EnemyHp=%s)', (afterBurst, p1Seals, c2EnemyHp) => {
    const fixture =
      afterBurst || p1Seals || c2EnemyHp
        ? withConds(afterBurst, p1Seals, c2EnemyHp)
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
