/**
 * Tighnari WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * List cond `c4`: Pando `value` 1-based into `['after','react']`.
 * p1AfterWreath / c2EnemyField are bool `'on'`. C4 teamBuff eleMas is hidden in
 * solo WR UIData — skip `eleMas` when on. A1 eleMas is ownBuff.
 *
 *   nx test gi-pando-parity -- tighnari.spec.ts
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
        key: 'Tighnari',
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
        location: 'Tighnari',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst_primary',
  'burst_secondary',
  'c6_cluster',
  'charged_aimed',
  'charged_aimedCharged',
  'charged_cluster',
  'charged_wreath',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
]

const C4_REACT_LIST_INDEX = 2

function withConds(
  p1AfterWreath: boolean,
  c2EnemyField: boolean,
  c4React: boolean
): ParityFixture {
  const wrTighnari: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (p1AfterWreath) {
    wrTighnari.p1AfterWreath = 'on'
    pandoConditionals.push({
      sheet: 'Tighnari',
      src: '0',
      dst: null,
      name: 'p1AfterWreath',
      value: 1,
    })
  }
  if (c2EnemyField) {
    wrTighnari.c2EnemyField = 'on'
    pandoConditionals.push({
      sheet: 'Tighnari',
      src: '0',
      dst: null,
      name: 'c2EnemyField',
      value: 1,
    })
  }
  if (c4React) {
    wrTighnari.c4 = 'react'
    pandoConditionals.push({
      sheet: 'Tighnari',
      src: '0',
      dst: null,
      name: 'c4',
      value: C4_REACT_LIST_INDEX,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Tighnari: wrTighnari },
    pandoConditionals,
  }
}

describe('Tighnari WR ↔ Pando finals', () => {
  test.each([
    [false, false, false],
    [true, false, false],
    [false, true, false],
    [false, false, true],
    [true, true, true],
  ] as const)('aligned finals (p1AfterWreath=%s c2EnemyField=%s c4React=%s)', (p1AfterWreath, c2EnemyField, c4React) => {
    const fixture =
      p1AfterWreath || c2EnemyField || c4React
        ? withConds(p1AfterWreath, c2EnemyField, c4React)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(
      wr,
      pando,
      c4React ? DEFAULT_FINALS.filter((s) => s !== 'eleMas') : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (c4React) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.eleMas).val as number).toBeGreaterThan(
        off.compute(own.final.eleMas).val as number
      )
    }
  })
})
