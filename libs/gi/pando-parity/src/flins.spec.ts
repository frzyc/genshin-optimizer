/**
 * Flins WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 * c2AfterElectro is WR teamBuff electro_enemyRes_ (enemy preRes in Pando); not in
 * DEFAULT_FINALS. A0 / C6 team lunarcharged_dmg_ are teamBuff.
 *
 *   nx test gi-pando-parity -- flins.spec.ts
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
        key: 'Flins',
        level: 80,
        talent: { auto: 8, skill: 8, burst: 8 },
        ascension: 6,
        constellation: 6,
      },
      weapon: {
        key: 'FavoniusLance',
        level: 90,
        ascension: 6,
        refinement: 1,
        location: 'Flins',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a0_base_lc_dmg_',
  'a4_eleMas',
  'burst_finalLunarDmg',
  'burst_middleLunarDmg',
  'burst_skillDmg',
  'burst_thunderAddlDmg',
  'burst_thunderDmg',
  'c2',
  'c4_eleMas',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_ca',
  'skill_na1',
  'skill_na2',
  'skill_na3',
  'skill_na4',
  'skill_na5',
  'skill_spearDmg',
]

function withConds(c2AfterElectro: boolean): ParityFixture {
  const wrConditionals: NonNullable<ParityFixture['wrConditionals']> = {
    Flins: {},
  }
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (c2AfterElectro) {
    wrConditionals.Flins.c2AfterElectro = 'on'
    pandoConditionals.push({
      sheet: 'Flins',
      src: '0',
      dst: null,
      name: 'c2AfterElectro',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals,
    pandoConditionals,
  }
}

describe('Flins WR ↔ Pando finals', () => {
  test.each([
    false,
    true,
  ])('aligned finals (c2AfterElectro=%s)', (c2AfterElectro) => {
    const fixture = withConds(c2AfterElectro)
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )
  })
})
