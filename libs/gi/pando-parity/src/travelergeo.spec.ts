/**
 * TravelerGeo WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bools `geoC1BurstArea` / `lockedPassiveHit` (WR `'on'`) on TravelerGeo.
 * `lockedPassive` / `bonusCanned` / `bonusSkirk*` are WR `cond('Traveler', …)`
 * registered on this key. `lockedPassiveHit` needs `lockedPassive`.
 *
 * C3 burst / C5 skill (WR skillBoost C5, burstBoost C3). C1 destIsActive
 * teamBuff critRate_ — skip `critRate_` when on. lockedPassiveHit shield_ is
 * teamBuff (not in DEFAULT_FINALS; skip none extra when on).
 *
 *   nx test gi-pando-parity -- travelergeo.spec.ts
 */
import { own } from '@genshin-optimizer/gi/formula'
import { expect } from 'vitest'
import {
  assertFinals,
  assertPandoListingsFinite,
  buildPando,
  buildWrSolo,
  DEFAULT_FINALS,
  type ParityFixture,
  pandoListingNames,
} from './harness'

const FIXTURE: ParityFixture = {
  members: [
    {
      char: {
        key: 'TravelerGeo',
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
        location: 'TravelerGeo',
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
  'c2',
  'charged_1',
  'charged_2',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
]

const LOCKED_PASSIVE_LISTINGS = ['lockedPassive_dmg1', 'lockedPassive_dmg2']
const C1_CRIT_RATE_ = 0.1
const LOCKED_PASSIVE_SHIELD_ = 0.2

function withConds(
  geoC1BurstArea: boolean,
  lockedPassive: boolean,
  lockedPassiveHit: boolean,
  bonusCanned: boolean
): ParityFixture {
  const wrTraveler: Record<string, string | number> = {}
  const wrTravelerGeo: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (geoC1BurstArea) {
    wrTravelerGeo.geoC1BurstArea = 'on'
    pandoConditionals.push({
      sheet: 'TravelerGeo',
      src: '0',
      dst: null,
      name: 'geoC1BurstArea',
      value: 1,
    })
  }
  if (lockedPassive) {
    wrTraveler.lockedPassive = 'on'
    pandoConditionals.push({
      sheet: 'TravelerGeo',
      src: '0',
      dst: null,
      name: 'lockedPassive',
      value: 1,
    })
  }
  if (lockedPassiveHit) {
    wrTravelerGeo.lockedPassiveHit = 'on'
    pandoConditionals.push({
      sheet: 'TravelerGeo',
      src: '0',
      dst: null,
      name: 'lockedPassiveHit',
      value: 1,
    })
  }
  if (bonusCanned) {
    wrTraveler.bonusCanned = 'on'
    pandoConditionals.push({
      sheet: 'TravelerGeo',
      src: '0',
      dst: null,
      name: 'bonusCanned',
      value: 1,
    })
  }
  const wrConditionals: NonNullable<ParityFixture['wrConditionals']> = {}
  if (Object.keys(wrTraveler).length) wrConditionals.Traveler = wrTraveler
  if (Object.keys(wrTravelerGeo).length)
    wrConditionals.TravelerGeo = wrTravelerGeo
  return {
    ...FIXTURE,
    wrConditionals,
    pandoConditionals,
  }
}

describe('TravelerGeo WR ↔ Pando finals', () => {
  test.each([
    [false, false, false, false],
    [true, false, false, false],
    [false, true, false, false],
    [false, true, true, false],
    [false, false, false, true],
    [true, true, true, true],
  ] as const)('aligned finals (geoC1BurstArea=%s lockedPassive=%s lockedPassiveHit=%s bonusCanned=%s)', (geoC1BurstArea, lockedPassive, lockedPassiveHit, bonusCanned) => {
    const fixture =
      geoC1BurstArea || lockedPassive || lockedPassiveHit || bonusCanned
        ? withConds(
            geoC1BurstArea,
            lockedPassive,
            lockedPassiveHit,
            bonusCanned
          )
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(
      wr,
      pando,
      geoC1BurstArea
        ? DEFAULT_FINALS.filter((s) => s !== 'critRate_')
        : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)
    const names = pandoListingNames(pando)
    expect(names).toEqual(expect.arrayContaining(EXPECTED_LISTINGS))
    if (lockedPassive) {
      expect(names).toEqual(expect.arrayContaining(LOCKED_PASSIVE_LISTINGS))
    }

    if (geoC1BurstArea) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.critRate_).val as number).toBeCloseTo(
        (off.compute(own.final.critRate_).val as number) + C1_CRIT_RATE_
      )
    }
    if (lockedPassive && lockedPassiveHit) {
      expect(pando.compute(own.premod.shield_).val as number).toBeCloseTo(
        LOCKED_PASSIVE_SHIELD_
      )
    }
  })
})
