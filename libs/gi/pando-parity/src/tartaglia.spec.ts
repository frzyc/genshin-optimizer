/**
 * Tartaglia WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * No kit conditionals. C3 skill / C5 burst. Melee NA/CA are skill-scaled
 * customDmg hydro. A0 autoBoost is teamBuff.char.auto.
 *
 *   nx test gi-pando-parity -- tartaglia.spec.ts
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
        key: 'Tartaglia',
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
        location: 'Tartaglia',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst_melee',
  'burst_ranged',
  'burst_riptideBlast',
  'charged_aimed',
  'charged_aimedCharged',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'normal_5',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'riptide_burst',
  'riptide_flash',
  'skill_charged1',
  'skill_charged2',
  'skill_normal1',
  'skill_normal2',
  'skill_normal3',
  'skill_normal4',
  'skill_normal5',
  'skill_normal61',
  'skill_normal62',
  'skill_riptideSlash',
  'skill_stance',
]

describe('Tartaglia WR ↔ Pando finals', () => {
  test('aligned finals', () => {
    const wr = buildWrSolo(FIXTURE)
    const pando = buildPando(FIXTURE)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )
  })
})
