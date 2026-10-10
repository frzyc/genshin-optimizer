/**
 * Klee WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bools `lockHomework` / `ExplosiveFrags` / `BlazingDelight` / `lockC1`.
 * Num `lockBadge` 0–3 ↔ WR `'1'`…`'3'`. C3 skill / C5 burst.
 * C2 def shred and C6 team pyro_dmg_ are teamBuff — not in DEFAULT_FINALS.
 * lockC1 atk_ is ownBuff (needs homework).
 *
 *   nx test gi-pando-parity -- klee.spec.ts
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
        key: 'Klee',
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
        location: 'Klee',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a1_charged',
  'burst',
  'c1',
  'c4',
  'charged',
  'jumptyDumptyDmg',
  'mineDmg',
  'normal_0',
  'normal_1',
  'normal_2',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
]

function withConds(
  lockHomework: boolean,
  ExplosiveFrags: boolean,
  BlazingDelight: boolean,
  lockC1: boolean
): ParityFixture {
  const wrKlee: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (lockHomework) {
    wrKlee.lockHomework = 'on'
    pandoConditionals.push({
      sheet: 'Klee',
      src: '0',
      dst: null,
      name: 'lockHomework',
      value: 1,
    })
  }
  if (ExplosiveFrags) {
    wrKlee.ExplosiveFrags = 'on'
    pandoConditionals.push({
      sheet: 'Klee',
      src: '0',
      dst: null,
      name: 'ExplosiveFrags',
      value: 1,
    })
  }
  if (BlazingDelight) {
    wrKlee.BlazingDelight = 'on'
    pandoConditionals.push({
      sheet: 'Klee',
      src: '0',
      dst: null,
      name: 'BlazingDelight',
      value: 1,
    })
  }
  if (lockC1) {
    wrKlee.lockC1 = 'on'
    pandoConditionals.push({
      sheet: 'Klee',
      src: '0',
      dst: null,
      name: 'lockC1',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Klee: wrKlee },
    pandoConditionals,
  }
}

describe('Klee WR ↔ Pando finals', () => {
  test.each([
    [false, false, false, false],
    [true, false, false, false],
    [false, true, false, false],
    [false, false, true, false],
    [true, true, true, true],
  ] as const)('aligned finals (homework=%s C2=%s C6=%s lockC1=%s)', (lockHomework, ExplosiveFrags, BlazingDelight, lockC1) => {
    const fixture =
      lockHomework || ExplosiveFrags || BlazingDelight || lockC1
        ? withConds(lockHomework, ExplosiveFrags, BlazingDelight, lockC1)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (lockHomework && lockC1) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.atk).val as number).toBeGreaterThan(
        off.compute(own.final.atk).val as number
      )
    }
  })
})
