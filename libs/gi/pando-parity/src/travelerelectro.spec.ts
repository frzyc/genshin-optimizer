/**
 * TravelerElectro WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bools `electroSkillAmulet` / `electroC2Thunder` (WR `'on'`) on TravelerElectro.
 * `lockedPassive` / `bonusCanned` / `bonusSkirk*` are WR `cond('Traveler', …)`
 * registered on this key.
 *
 * C3 burst / C5 skill (WR skillBoost C5, burstBoost C3). Amulet destIsActive
 * teamBuff enerRech_ is hidden in solo WR UIData — skip `enerRech_` when on.
 *
 *   nx test gi-pando-parity -- travelerelectro.spec.ts
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
        key: 'TravelerElectro',
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
        location: 'TravelerElectro',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst_press',
  'burst_thirdThunder',
  'burst_thunder',
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

const LOCKED_PASSIVE_LISTINGS = [
  'lockedPassive_dmg1',
  'lockedPassive_dmg2',
  'lockedPassive_lightning',
]

function withConds(
  electroSkillAmulet: boolean,
  electroC2Thunder: boolean,
  lockedPassive: boolean,
  bonusCanned: boolean
): ParityFixture {
  const wrTraveler: Record<string, string | number> = {}
  const wrTravelerElectro: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (electroSkillAmulet) {
    wrTravelerElectro.electroSkillAmulet = 'on'
    pandoConditionals.push({
      sheet: 'TravelerElectro',
      src: '0',
      dst: null,
      name: 'electroSkillAmulet',
      value: 1,
    })
  }
  if (electroC2Thunder) {
    wrTravelerElectro.electroC2Thunder = 'on'
    pandoConditionals.push({
      sheet: 'TravelerElectro',
      src: '0',
      dst: null,
      name: 'electroC2Thunder',
      value: 1,
    })
  }
  if (lockedPassive) {
    wrTraveler.lockedPassive = 'on'
    pandoConditionals.push({
      sheet: 'TravelerElectro',
      src: '0',
      dst: null,
      name: 'lockedPassive',
      value: 1,
    })
  }
  if (bonusCanned) {
    wrTraveler.bonusCanned = 'on'
    pandoConditionals.push({
      sheet: 'TravelerElectro',
      src: '0',
      dst: null,
      name: 'bonusCanned',
      value: 1,
    })
  }
  const wrConditionals: NonNullable<ParityFixture['wrConditionals']> = {}
  if (Object.keys(wrTraveler).length) wrConditionals.Traveler = wrTraveler
  if (Object.keys(wrTravelerElectro).length)
    wrConditionals.TravelerElectro = wrTravelerElectro
  return {
    ...FIXTURE,
    wrConditionals,
    pandoConditionals,
  }
}

describe('TravelerElectro WR ↔ Pando finals', () => {
  test.each([
    [false, false, false, false],
    [true, false, false, false],
    [false, true, false, false],
    [false, false, true, false],
    [false, false, false, true],
    [true, true, true, true],
  ] as const)('aligned finals (electroSkillAmulet=%s electroC2Thunder=%s lockedPassive=%s bonusCanned=%s)', (electroSkillAmulet, electroC2Thunder, lockedPassive, bonusCanned) => {
    const fixture =
      electroSkillAmulet || electroC2Thunder || lockedPassive || bonusCanned
        ? withConds(
            electroSkillAmulet,
            electroC2Thunder,
            lockedPassive,
            bonusCanned
          )
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(
      wr,
      pando,
      electroSkillAmulet
        ? DEFAULT_FINALS.filter((s) => s !== 'enerRech_')
        : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)
    const names = pandoListingNames(pando)
    expect(names).toEqual(expect.arrayContaining(EXPECTED_LISTINGS))
    if (lockedPassive) {
      expect(names).toEqual(expect.arrayContaining(LOCKED_PASSIVE_LISTINGS))
    }

    if (electroSkillAmulet) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.enerRech_).val as number).toBeGreaterThan(
        off.compute(own.final.enerRech_).val as number
      )
    }
  })
})
