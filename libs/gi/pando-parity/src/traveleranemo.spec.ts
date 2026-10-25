/**
 * TravelerAnemo WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Lists `skillAbsorption` / `anemoBurstAbsorption`: Pando `value` is 1-based
 * absorbableEle (hydro=1, pyro=2, …). Bool `anemoC6Hit` (WR `'on'`).
 * `lockedPassive` / `bonusCanned` / `bonusSkirk*` are WR `cond('Traveler', …)`
 * registered on Pando sheet TravelerAnemo. WR auto-sets `traveleranemo` in
 * wr/api.ts (`dataObjForCharacterNew`); harness uses `dataObjForCharacter`,
 * so set `Traveler.traveleranemo` when probing lockedPassive critRate_.
 *
 * C3 burst / C5 skill (WR skillBoost C5, burstBoost C3). C2 enerRech_ is
 * always-on at C2. C6 is enemyDebuff preRes (not in DEFAULT_FINALS).
 *
 *   nx test gi-pando-parity -- traveleranemo.spec.ts
 */
import { own } from '@genshin-optimizer/gi/formula'
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
        key: 'TravelerAnemo',
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
        location: 'TravelerAnemo',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a1',
  'a2_heal',
  'burst',
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
  'skill_initial_dmg',
  'skill_initial_max',
  'skill_storm_dmg',
  'skill_storm_max',
]

const SKILL_ABSORB_PYRO_LISTINGS = [
  'skill_initial_ele_pyro',
  'skill_max_ele_pyro',
  'skill_storm_ele_pyro',
  'skill_storm_ele_max_pyro',
]

const LOCKED_PASSIVE_LISTINGS = [
  'lockedPassive_cryo',
  'lockedPassive_dmg1',
  'lockedPassive_dmg2',
  'lockedPassive_electro',
  'lockedPassive_hydro',
  'lockedPassive_pyro',
]

const ABSORB_PYRO_LIST_INDEX = 2
const LOCKED_PASSIVE_CRIT_RATE_ = 0.1

function withConds(
  skillAbsorption: boolean,
  anemoBurstAbsorption: boolean,
  anemoC6Hit: boolean,
  lockedPassive: boolean,
  bonuses: boolean
): ParityFixture {
  const wrTraveler: Record<string, string | number> = {}
  const wrTravelerAnemo: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (skillAbsorption) {
    wrTravelerAnemo.skillAbsorption = 'pyro'
    pandoConditionals.push({
      sheet: 'TravelerAnemo',
      src: '0',
      dst: null,
      name: 'skillAbsorption',
      value: ABSORB_PYRO_LIST_INDEX,
    })
  }
  if (anemoBurstAbsorption) {
    wrTravelerAnemo.anemoBurstAbsorption = 'pyro'
    pandoConditionals.push({
      sheet: 'TravelerAnemo',
      src: '0',
      dst: null,
      name: 'anemoBurstAbsorption',
      value: ABSORB_PYRO_LIST_INDEX,
    })
  }
  if (anemoC6Hit) {
    wrTravelerAnemo.anemoC6Hit = 'on'
    pandoConditionals.push({
      sheet: 'TravelerAnemo',
      src: '0',
      dst: null,
      name: 'anemoC6Hit',
      value: 1,
    })
  }
  if (lockedPassive) {
    wrTraveler.lockedPassive = 'on'
    wrTraveler.traveleranemo = 'on'
    pandoConditionals.push({
      sheet: 'TravelerAnemo',
      src: '0',
      dst: null,
      name: 'lockedPassive',
      value: 1,
    })
  }
  if (bonuses) {
    wrTraveler.bonusCanned = 'on'
    wrTraveler.bonusSkirk1 = 'on'
    wrTraveler.bonusSkirk2 = 'on'
    wrTraveler.bonusSkirk3 = 'on'
    for (const name of [
      'bonusCanned',
      'bonusSkirk1',
      'bonusSkirk2',
      'bonusSkirk3',
    ]) {
      pandoConditionals.push({
        sheet: 'TravelerAnemo',
        src: '0',
        dst: null,
        name,
        value: 1,
      })
    }
  }
  const wrConditionals: NonNullable<ParityFixture['wrConditionals']> = {}
  if (Object.keys(wrTraveler).length) wrConditionals.Traveler = wrTraveler
  if (Object.keys(wrTravelerAnemo).length)
    wrConditionals.TravelerAnemo = wrTravelerAnemo
  return {
    ...FIXTURE,
    wrConditionals,
    pandoConditionals,
  }
}

describe('TravelerAnemo WR ↔ Pando finals', () => {
  test.each([
    [false, false, false, false, false],
    [true, false, false, false, false],
    [false, true, true, false, false],
    [false, false, false, true, false],
    [false, false, false, false, true],
    [true, true, true, true, true],
  ] as const)('aligned finals (skillAbs=%s burstAbs=%s c6=%s lockedPassive=%s bonuses=%s)', (skillAbsorption, anemoBurstAbsorption, anemoC6Hit, lockedPassive, bonuses) => {
    const anyCond =
      skillAbsorption ||
      anemoBurstAbsorption ||
      anemoC6Hit ||
      lockedPassive ||
      bonuses
    const fixture = anyCond
      ? withConds(
          skillAbsorption,
          anemoBurstAbsorption,
          anemoC6Hit,
          lockedPassive,
          bonuses
        )
      : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    const names = pandoListingNames(pando)
    expect(names).toEqual(expect.arrayContaining(EXPECTED_LISTINGS))
    if (skillAbsorption) {
      expect(names).toEqual(expect.arrayContaining(SKILL_ABSORB_PYRO_LISTINGS))
    }
    if (anemoBurstAbsorption) {
      expect(names).toEqual(expect.arrayContaining(['burst_absorb_pyro']))
    }
    if (lockedPassive) {
      expect(names).toEqual(expect.arrayContaining(LOCKED_PASSIVE_LISTINGS))
    }

    if (lockedPassive) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.critRate_).val as number).toBeCloseTo(
        (off.compute(own.final.critRate_).val as number) +
          LOCKED_PASSIVE_CRIT_RATE_
      )
    }
    if (bonuses) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.atk).val as number).toBeGreaterThan(
        off.compute(own.final.atk).val as number
      )
      expect(pando.compute(own.final.eleMas).val as number).toBeGreaterThan(
        off.compute(own.final.eleMas).val as number
      )
      expect(pando.compute(own.final.hp).val as number).toBeGreaterThan(
        off.compute(own.final.hp).val as number
      )
    }
  })
})
