/**
 * Kirara WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 * A4 skill_/burst_dmg_ are not in DEFAULT_FINALS.
 * C6 is WR teamBuff all-ele dmg_; solo computeUIData does not apply it.
 *
 *   nx test gi-pando-parity -- kirara.spec.ts
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
        key: 'Kirara',
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
        location: 'Kirara',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'burst_explosion',
  'c4',
  'charged_dmg1',
  'charged_dmg2',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_parcel',
  'skill_strike',
  'skill_tail',
]

describe('Kirara WR ↔ Pando finals', () => {
  test.each([
    false,
    true,
  ])('aligned finals (c6AfterSkillBurst=%s)', (c6AfterSkillBurst) => {
    const fixture: ParityFixture = c6AfterSkillBurst
      ? {
          ...FIXTURE,
          wrConditionals: { Kirara: { c6AfterSkillBurst: 'on' } },
          pandoConditionals: [
            {
              sheet: 'Kirara',
              src: '0',
              dst: null,
              name: 'c6AfterSkillBurst',
              value: 1,
            },
          ],
        }
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
