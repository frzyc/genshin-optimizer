/**
 * Ningguang WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 * A4 geo_dmg_ / C4 party RES are not in DEFAULT_FINALS.
 *
 *   nx test gi-pando-parity -- ningguang.spec.ts
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
        key: 'Ningguang',
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
        location: 'Ningguang',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'charged',
  'charged_jade',
  'normal_0',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
  'skill_screenHp',
]

function withConds(a4: boolean, c4: boolean): ParityFixture {
  const wrConditionals: NonNullable<ParityFixture['wrConditionals']> = {
    Ningguang: {},
  }
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (a4) {
    wrConditionals.Ningguang.Ascension4 = 'on'
    pandoConditionals.push({
      sheet: 'Ningguang',
      src: '0',
      dst: null,
      name: 'Ascension4',
      value: 1,
    })
  }
  if (c4) {
    wrConditionals.Ningguang.Constellation4 = 'on'
    pandoConditionals.push({
      sheet: 'Ningguang',
      src: '0',
      dst: null,
      name: 'Constellation4',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals,
    pandoConditionals,
  }
}

describe('Ningguang WR ↔ Pando finals', () => {
  test.each([
    [false, false],
    [true, false],
    [false, true],
    [true, true],
  ] as const)('aligned finals (Ascension4=%s Constellation4=%s)', (a4, c4) => {
    const fixture = withConds(a4, c4)
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    // Common geo reactions also list shattered / lunarcrystallize.
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )
  })
})
