/**
 * TravelerHydro WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bools `suffusion` / `lockedPassiveHp` (WR `'on'`) and list
 * `a4HpConsumedPercent` (WR lookup hpCost..6*hpCost) on TravelerHydro.
 * `lockedPassive` / `bonusCanned` / `bonusSkirk*` are WR `cond('Traveler', …)`
 * registered on this key. `lockedPassiveHp` needs `lockedPassive`.
 *
 * C3 skill / C5 burst (WR skillBoost C3, burstBoost C5).
 *
 *   nx test gi-pando-parity -- travelerhydro.spec.ts
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
        key: 'TravelerHydro',
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
        location: 'TravelerHydro',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a1_heal',
  'burst',
  'c4_hydroShield',
  'c4_shield',
  'c6_heal',
  'charged_1',
  'charged_2',
  'lockedPassive_heal',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_dewdrop',
  'skill_surge',
  'skill_thorn',
  'suffusion_hpCost',
]

const LOCKED_PASSIVE_LISTINGS = ['lockedPassive_dmg1', 'lockedPassive_dmg2']
const A4_HP_CONSUMED_MAX = 0.24

function withConds(
  suffusion: boolean,
  a4Max: boolean,
  lockedPassive: boolean,
  lockedPassiveHp: boolean,
  bonusCanned: boolean
): ParityFixture {
  const wrTraveler: Record<string, string | number> = {}
  const wrTravelerHydro: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (suffusion) {
    wrTravelerHydro.suffusion = 'on'
    pandoConditionals.push({
      sheet: 'TravelerHydro',
      src: '0',
      dst: null,
      name: 'suffusion',
      value: 1,
    })
  }
  if (a4Max) {
    wrTravelerHydro.a4HpConsumedPercent = A4_HP_CONSUMED_MAX
    pandoConditionals.push({
      sheet: 'TravelerHydro',
      src: '0',
      dst: null,
      name: 'a4HpConsumedPercent',
      value: 6,
    })
  }
  if (lockedPassive) {
    wrTraveler.lockedPassive = 'on'
    pandoConditionals.push({
      sheet: 'TravelerHydro',
      src: '0',
      dst: null,
      name: 'lockedPassive',
      value: 1,
    })
  }
  if (lockedPassiveHp) {
    wrTravelerHydro.lockedPassiveHp = 'on'
    pandoConditionals.push({
      sheet: 'TravelerHydro',
      src: '0',
      dst: null,
      name: 'lockedPassiveHp',
      value: 1,
    })
  }
  if (bonusCanned) {
    wrTraveler.bonusCanned = 'on'
    pandoConditionals.push({
      sheet: 'TravelerHydro',
      src: '0',
      dst: null,
      name: 'bonusCanned',
      value: 1,
    })
  }
  const wrConditionals: NonNullable<ParityFixture['wrConditionals']> = {}
  if (Object.keys(wrTraveler).length) wrConditionals.Traveler = wrTraveler
  if (Object.keys(wrTravelerHydro).length)
    wrConditionals.TravelerHydro = wrTravelerHydro
  return {
    ...FIXTURE,
    wrConditionals,
    pandoConditionals,
  }
}

describe('TravelerHydro WR ↔ Pando finals', () => {
  test.each([
    [false, false, false, false, false],
    [true, false, false, false, false],
    [true, true, false, false, false],
    [false, false, true, false, false],
    [false, false, true, true, false],
    [false, false, false, false, true],
    [true, true, true, true, true],
  ] as const)('aligned finals (suffusion=%s a4Max=%s lockedPassive=%s lockedPassiveHp=%s bonusCanned=%s)', (suffusion, a4Max, lockedPassive, lockedPassiveHp, bonusCanned) => {
    const fixture =
      suffusion || a4Max || lockedPassive || lockedPassiveHp || bonusCanned
        ? withConds(
            suffusion,
            a4Max,
            lockedPassive,
            lockedPassiveHp,
            bonusCanned
          )
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    const names = pandoListingNames(pando)
    expect(names).toEqual(expect.arrayContaining(EXPECTED_LISTINGS))
    if (lockedPassive) {
      expect(names).toEqual(expect.arrayContaining(LOCKED_PASSIVE_LISTINGS))
    }
  })
})
