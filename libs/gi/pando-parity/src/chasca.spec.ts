/**
 * Chasca WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 * a1InMultitarget / c6FatalRounds are listing-local (shining charged_dmg_ / C6 critDMG_).
 *
 *   nx test gi-pando-parity -- chasca.spec.ts
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
        key: 'Chasca',
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
        location: 'Chasca',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a4_anemo',
  'a4_cryo',
  'a4_electro',
  'a4_hydro',
  'a4_pyro',
  'burst_galeSplittingDmg',
  'burst_radiantDmg_cryo',
  'burst_radiantDmg_electro',
  'burst_radiantDmg_hydro',
  'burst_radiantDmg_pyro',
  'burst_shellDmg',
  'c2_cryo',
  'c2_electro',
  'c2_hydro',
  'c2_pyro',
  'c4_cryo',
  'c4_electro',
  'c4_hydro',
  'c4_pyro',
  'charged_aimed',
  'charged_fullyAimed',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_activationDmg',
  'skill_pressDmg',
  'skill_shellDmg',
  'skill_shiningShellDmg_cryo',
  'skill_shiningShellDmg_electro',
  'skill_shiningShellDmg_hydro',
  'skill_shiningShellDmg_pyro',
]

function withConds(
  a1InMultitarget: boolean,
  c6FatalRounds: boolean
): ParityFixture {
  const wrConditionals: NonNullable<ParityFixture['wrConditionals']> = {
    Chasca: {},
  }
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (a1InMultitarget) {
    wrConditionals.Chasca.a1InMultitarget = 'on'
    pandoConditionals.push({
      sheet: 'Chasca',
      src: '0',
      dst: null,
      name: 'a1InMultitarget',
      value: 1,
    })
  }
  if (c6FatalRounds) {
    wrConditionals.Chasca.c6FatalRounds = 'on'
    pandoConditionals.push({
      sheet: 'Chasca',
      src: '0',
      dst: null,
      name: 'c6FatalRounds',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals,
    pandoConditionals,
  }
}

describe('Chasca WR ↔ Pando finals', () => {
  test.each([
    [false, false],
    [true, false],
    [false, true],
    [true, true],
  ] as const)('aligned finals (a1InMultitarget=%s c6FatalRounds=%s)', (a1InMultitarget, c6FatalRounds) => {
    const fixture = withConds(a1InMultitarget, c6FatalRounds)
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )
  })
})
