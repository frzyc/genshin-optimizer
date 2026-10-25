/**
 * Razor WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Num cond `ElectroSigil`: Pando 0–3 ↔ WR lookup keys `'1'`…`'3'`.
 * lockHomework / TheWolfWithin / A4 / C1 / C2 / C4 / lockC6Sigil are bool `'on'`.
 * C4 enemyDefRed_ is WR teamBuff — not in DEFAULT_FINALS.
 *
 *   nx test gi-pando-parity -- razor.spec.ts
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
        key: 'Razor',
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
        location: 'Razor',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'c6',
  'charged_final',
  'charged_spin',
  'companionDmg1',
  'companionDmg2',
  'companionDmg3',
  'companionDmg4',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_hold',
  'skill_press',
]

function withConds(
  ElectroSigil: number,
  TheWolfWithin: boolean,
  A4: boolean,
  C2: boolean
): ParityFixture {
  const wrRazor: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (ElectroSigil > 0) {
    wrRazor.ElectroSigil = String(ElectroSigil)
    pandoConditionals.push({
      sheet: 'Razor',
      src: '0',
      dst: null,
      name: 'ElectroSigil',
      value: ElectroSigil,
    })
  }
  if (TheWolfWithin) {
    wrRazor.TheWolfWithin = 'on'
    pandoConditionals.push({
      sheet: 'Razor',
      src: '0',
      dst: null,
      name: 'TheWolfWithin',
      value: 1,
    })
  }
  if (A4) {
    wrRazor.A4 = 'on'
    pandoConditionals.push({
      sheet: 'Razor',
      src: '0',
      dst: null,
      name: 'A4',
      value: 1,
    })
  }
  if (C2) {
    wrRazor.C2 = 'on'
    pandoConditionals.push({
      sheet: 'Razor',
      src: '0',
      dst: null,
      name: 'C2',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Razor: wrRazor },
    pandoConditionals,
  }
}

describe('Razor WR ↔ Pando finals', () => {
  test.each([
    [0, false, false, false],
    [3, false, false, false],
    [0, true, false, false],
    [0, false, true, false],
    [0, false, false, true],
    [3, true, true, true],
  ] as const)('aligned finals (ElectroSigil=%s TheWolfWithin=%s A4=%s C2=%s)', (ElectroSigil, TheWolfWithin, A4, C2) => {
    const fixture =
      ElectroSigil || TheWolfWithin || A4 || C2
        ? withConds(ElectroSigil, TheWolfWithin, A4, C2)
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
