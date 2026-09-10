/**
 * TravelerPyro WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bools `c1SkillActive` / `c1Ns` / `c4AfterBurst` / `c6InNs` are `'on'` on
 * TravelerPyro. `lockedPassive` / `bonusCanned` / `bonusSkirk*` are WR
 * `cond('Traveler', …)` registered on Pando sheet TravelerPyro. WR auto-sets
 * `travelerpyro` in wr/api.ts (`dataObjForCharacterNew`); harness uses
 * `dataObjForCharacter`, so set `Traveler.travelerpyro` when probing
 * lockedPassive atk_. C1 all_dmg_ is dest-gated teamBuff (not DEFAULT_FINALS).
 * C4 pyro_dmg_ and C6 move critDMG_ / infusion are ownBuff. C3 skill / C5 burst.
 *
 *   nx test gi-pando-parity -- travelerpyro.spec.ts
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
        key: 'TravelerPyro',
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
        location: 'TravelerPyro',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
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
  'skill_blazingDmg',
  'skill_nsLimit',
  'skill_scorchingDmg',
  'skill_scorchingInstantDmg',
]

const LOCKED_PASSIVE_LISTINGS = [
  'lockedPassive_cd',
  'lockedPassive_dmg1',
  'lockedPassive_dmg2',
]

type TravelerPyroConds = {
  c1SkillActive?: boolean
  c1Ns?: boolean
  c4AfterBurst?: boolean
  c6InNs?: boolean
  lockedPassive?: boolean
  bonuses?: boolean
}

function withConds(conds: TravelerPyroConds): ParityFixture {
  const wrPyro: Record<string, string | number> = {}
  const wrTraveler: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  const pushPyro = (name: string) => {
    wrPyro[name] = 'on'
    pandoConditionals.push({
      sheet: 'TravelerPyro',
      src: '0',
      dst: null,
      name,
      value: 1,
    })
  }
  if (conds.c1SkillActive) pushPyro('c1SkillActive')
  if (conds.c1Ns) pushPyro('c1Ns')
  if (conds.c4AfterBurst) pushPyro('c4AfterBurst')
  if (conds.c6InNs) pushPyro('c6InNs')
  if (conds.lockedPassive) {
    wrTraveler.lockedPassive = 'on'
    wrTraveler.travelerpyro = 'on'
    pandoConditionals.push({
      sheet: 'TravelerPyro',
      src: '0',
      dst: null,
      name: 'lockedPassive',
      value: 1,
    })
    pandoConditionals.push({
      sheet: 'Traveler',
      src: '0',
      dst: null,
      name: 'travelerpyro',
      value: 1,
    })
  }
  if (conds.bonuses) {
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
        sheet: 'TravelerPyro',
        src: '0',
        dst: null,
        name,
        value: 1,
      })
    }
  }
  const wrConditionals: NonNullable<ParityFixture['wrConditionals']> = {}
  if (Object.keys(wrPyro).length) wrConditionals.TravelerPyro = wrPyro
  if (Object.keys(wrTraveler).length) wrConditionals.Traveler = wrTraveler
  return {
    ...FIXTURE,
    wrConditionals,
    pandoConditionals,
  }
}

describe('TravelerPyro WR ↔ Pando finals', () => {
  test.each([
    [{}],
    [{ c1SkillActive: true }],
    [{ c1SkillActive: true, c1Ns: true }],
    [{ c4AfterBurst: true }],
    [{ c6InNs: true }],
    [{ lockedPassive: true }],
    [{ bonuses: true }],
    [
      {
        c1SkillActive: true,
        c1Ns: true,
        c4AfterBurst: true,
        c6InNs: true,
        lockedPassive: true,
        bonuses: true,
      },
    ],
  ] as const)('aligned finals %j', (conds) => {
    const fixture = Object.keys(conds).length ? withConds(conds) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    const names = pandoListingNames(pando)
    expect(names).toEqual(expect.arrayContaining(EXPECTED_LISTINGS))
    if (conds.lockedPassive) {
      expect(names).toEqual(expect.arrayContaining(LOCKED_PASSIVE_LISTINGS))
    }

    const off = buildPando(FIXTURE)
    if (conds.c4AfterBurst) {
      // C1 writes untagged `dmg_` (teamBuff, dest-gated); C4 writes `dmg_.pyro`.
      const c1 = (conds.c1SkillActive ? 0.06 : 0) + (conds.c1Ns ? 0.09 : 0)
      expect(pando.compute(own.premod.dmg_.pyro).val as number).toBeCloseTo(
        (off.compute(own.premod.dmg_.pyro).val as number) + 0.2 + c1
      )
    }
    if (conds.c6InNs) {
      const globalCd = pando.compute(own.final.critDMG_).val as number
      expect(
        (pando.compute(own.final.critDMG_.normal).val as number) - globalCd
      ).toBeCloseTo(0.4)
    }
    if (conds.lockedPassive) {
      expect(pando.compute(own.final.atk).val as number).toBeGreaterThan(
        off.compute(own.final.atk).val as number
      )
    }
    if (conds.bonuses) {
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
