/**
 * Chongyun WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * List conds: `skill` `['activeInArea']`, `asc4` `['hit']`. c6 is bool `'on'`.
 * Skill-field cryo infusion is listing-local. A1 atkSPD_ / A4 cryo shred are
 * teamBuff — not in DEFAULT_FINALS.
 *
 *   nx test gi-pando-parity -- chongyun.spec.ts
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
        key: 'Chongyun',
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
        location: 'Chongyun',
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
  'c1',
  'charged_final',
  'charged_spin',
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
  skillField: boolean,
  asc4: boolean,
  c6: boolean
): ParityFixture {
  const wrChongyun: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (skillField) {
    wrChongyun.skill = 'activeInArea'
    pandoConditionals.push({
      sheet: 'Chongyun',
      src: '0',
      dst: null,
      name: 'skill',
      value: 1,
    })
  }
  if (asc4) {
    wrChongyun.asc4 = 'hit'
    pandoConditionals.push({
      sheet: 'Chongyun',
      src: '0',
      dst: null,
      name: 'asc4',
      value: 1,
    })
  }
  if (c6) {
    wrChongyun.c6 = 'on'
    pandoConditionals.push({
      sheet: 'Chongyun',
      src: '0',
      dst: null,
      name: 'c6',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Chongyun: wrChongyun },
    pandoConditionals,
  }
}

describe('Chongyun WR ↔ Pando finals', () => {
  test.each([
    [false, false, false],
    [true, false, false],
    [false, true, false],
    [false, false, true],
    [true, true, true],
  ] as const)('aligned finals (skillField=%s asc4=%s c6=%s)', (skillField, asc4, c6) => {
    const fixture =
      skillField || asc4 || c6 ? withConds(skillField, asc4, c6) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )
  })
})
