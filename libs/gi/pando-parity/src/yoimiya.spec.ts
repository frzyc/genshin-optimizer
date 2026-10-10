/**
 * Yoimiya WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * List `skill` / `c1` / `c2` — Pando `value: 1` ↔ WR state string (not `'on'`).
 * Num `a1` 0–10 ↔ WR `'1'`…`'10'`. Bool `burst`. C3 skill / C5 burst.
 * Skill pyro NA is listing-local. A4 atk_ is notOwnBuff.
 *
 *   nx test gi-pando-parity -- yoimiya.spec.ts
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
        key: 'Yoimiya',
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
        location: 'Yoimiya',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'burst_exp',
  'charged_full',
  'charged_hit',
  'charged_kindling',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
]

function withConds(
  skill: boolean,
  a1: number,
  burst: boolean,
  c1: boolean,
  c2: boolean
): ParityFixture {
  const wrYoimiya: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (skill) {
    wrYoimiya.skill = 'skill'
    pandoConditionals.push({
      sheet: 'Yoimiya',
      src: '0',
      dst: null,
      name: 'skill',
      value: 1,
    })
  }
  if (a1 > 0) {
    wrYoimiya.a1 = String(a1)
    pandoConditionals.push({
      sheet: 'Yoimiya',
      src: '0',
      dst: null,
      name: 'a1',
      value: a1,
    })
  }
  if (burst) {
    wrYoimiya.burst = 'on'
    pandoConditionals.push({
      sheet: 'Yoimiya',
      src: '0',
      dst: null,
      name: 'burst',
      value: 1,
    })
  }
  if (c1) {
    wrYoimiya.c1 = 'c1'
    pandoConditionals.push({
      sheet: 'Yoimiya',
      src: '0',
      dst: null,
      name: 'c1',
      value: 1,
    })
  }
  if (c2) {
    wrYoimiya.c2 = 'c2'
    pandoConditionals.push({
      sheet: 'Yoimiya',
      src: '0',
      dst: null,
      name: 'c2',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Yoimiya: wrYoimiya },
    pandoConditionals,
  }
}

describe('Yoimiya WR ↔ Pando finals', () => {
  test.each([
    [false, 0, false, false, false],
    [true, 10, false, false, false],
    [false, 0, true, false, false],
    [false, 0, false, true, false],
    [true, 10, true, true, true],
  ] as const)('aligned finals (skill=%s a1=%s burst=%s c1=%s c2=%s)', (skill, a1, burst, c1, c2) => {
    const fixture =
      skill || a1 || burst || c1 || c2
        ? withConds(skill, a1, burst, c1, c2)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (c1) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.atk).val as number).toBeGreaterThan(
        off.compute(own.final.atk).val as number
      )
    }
  })
})
