/**
 * TravelerDendro WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Num `a1Stacks` 1–10 ↔ WR `'1'`…`'10'`. Bool `c6BurstEffect` is `'on'`.
 * List `c6BurstEle` is hydro/pyro/electro (not `'on'`); Pando `value` is
 * 1-based (hydro=1). `lockedPassive` / `bonusCanned` / `bonusSkirk*` are WR
 * `cond('Traveler', …)` registered on this key.
 *
 * C3 skill / C5 burst (WR skillBoost C3, burstBoost C5). A1 destIsActive
 * teamBuff eleMas is hidden in solo WR UIData — skip `eleMas` when on.
 *
 *   nx test gi-pando-parity -- travelerdendro.spec.ts
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
        key: 'TravelerDendro',
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
        location: 'TravelerDendro',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst_explosion',
  'burst_lamp',
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
  'lockedPassive_vinecore',
]

const C6_ELE_HYDRO_LIST_INDEX = 1
const C6_ELE_DMG_ = 0.12

function withConds(
  a1Stacks: number,
  c6BurstEffect: boolean,
  c6BurstEleHydro: boolean,
  lockedPassive: boolean,
  bonuses: boolean
): ParityFixture {
  const wrTraveler: Record<string, string | number> = {}
  const wrTravelerDendro: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (a1Stacks > 0) {
    wrTravelerDendro.a1Stacks = String(a1Stacks)
    pandoConditionals.push({
      sheet: 'TravelerDendro',
      src: '0',
      dst: null,
      name: 'a1Stacks',
      value: a1Stacks,
    })
  }
  if (c6BurstEffect) {
    wrTravelerDendro.c6BurstEffect = 'on'
    pandoConditionals.push({
      sheet: 'TravelerDendro',
      src: '0',
      dst: null,
      name: 'c6BurstEffect',
      value: 1,
    })
  }
  if (c6BurstEleHydro) {
    wrTravelerDendro.c6BurstEle = 'hydro'
    pandoConditionals.push({
      sheet: 'TravelerDendro',
      src: '0',
      dst: null,
      name: 'c6BurstEle',
      value: C6_ELE_HYDRO_LIST_INDEX,
    })
  }
  if (lockedPassive) {
    wrTraveler.lockedPassive = 'on'
    pandoConditionals.push({
      sheet: 'TravelerDendro',
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
        sheet: 'TravelerDendro',
        src: '0',
        dst: null,
        name,
        value: 1,
      })
    }
  }
  const wrConditionals: NonNullable<ParityFixture['wrConditionals']> = {}
  if (Object.keys(wrTraveler).length) wrConditionals.Traveler = wrTraveler
  if (Object.keys(wrTravelerDendro).length)
    wrConditionals.TravelerDendro = wrTravelerDendro
  return {
    ...FIXTURE,
    wrConditionals,
    pandoConditionals,
  }
}

describe('TravelerDendro WR ↔ Pando finals', () => {
  test.each([
    [0, false, false, false, false],
    [10, false, false, false, false],
    [0, true, false, false, false],
    [0, true, true, false, false],
    [0, false, false, true, false],
    [0, false, false, false, true],
    [10, true, true, true, true],
  ] as const)('aligned finals (a1Stacks=%s c6BurstEffect=%s c6BurstEleHydro=%s lockedPassive=%s bonuses=%s)', (a1Stacks, c6BurstEffect, c6BurstEleHydro, lockedPassive, bonuses) => {
    const anyCond =
      a1Stacks || c6BurstEffect || c6BurstEleHydro || lockedPassive || bonuses
    const fixture = anyCond
      ? withConds(
          a1Stacks,
          c6BurstEffect,
          c6BurstEleHydro,
          lockedPassive,
          bonuses
        )
      : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    // WR teamBuff.eleMas is hidden in solo UIData; Pando destIsActive applies it.
    assertFinals(
      wr,
      pando,
      a1Stacks ? DEFAULT_FINALS.filter((s) => s !== 'eleMas') : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)
    const names = pandoListingNames(pando)
    expect(names).toEqual(expect.arrayContaining(EXPECTED_LISTINGS))
    if (lockedPassive) {
      expect(names).toEqual(expect.arrayContaining(LOCKED_PASSIVE_LISTINGS))
    }

    const off = buildPando(FIXTURE)
    if (a1Stacks) {
      expect(pando.compute(own.final.eleMas).val as number).toBeGreaterThan(
        off.compute(own.final.eleMas).val as number
      )
    }
    if (c6BurstEffect) {
      expect(pando.compute(own.premod.dmg_.dendro).val as number).toBeCloseTo(
        C6_ELE_DMG_
      )
    }
    if (c6BurstEffect && c6BurstEleHydro) {
      expect(pando.compute(own.premod.dmg_.hydro).val as number).toBeCloseTo(
        C6_ELE_DMG_
      )
    }
    if (bonuses) {
      expect(pando.compute(own.final.atk).val as number).toBeGreaterThan(
        off.compute(own.final.atk).val as number
      )
      expect(pando.compute(own.final.hp).val as number).toBeGreaterThan(
        off.compute(own.final.hp).val as number
      )
      if (!a1Stacks) {
        expect(pando.compute(own.final.eleMas).val as number).toBeGreaterThan(
          off.compute(own.final.eleMas).val as number
        )
      }
    }
  })
})
