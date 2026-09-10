/**
 * Sayu WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * List cond `skillAbsorption`: Pando `value` is 1-based index into absorbableEle.
 * Num cond `c2SkillStack`: Pando 0–20 ↔ WR lookup keys `'1'`…`'20'`.
 *
 *   nx test gi-pando-parity -- sayu.spec.ts
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
        key: 'Sayu',
        level: 80,
        talent: { auto: 8, skill: 8, burst: 8 },
        ascension: 6,
        constellation: 6,
      },
      weapon: {
        key: 'FavoniusGreatsword',
        level: 90,
        ascension: 6,
        refinement: 1,
        location: 'Sayu',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a1Heal',
  'a4ExtraHeal',
  'charged_final',
  'charged_spin',
  'darumaDmg',
  'darumaHeal',
  'eleKickDmg_cryo',
  'eleKickDmg_electro',
  'eleKickDmg_hydro',
  'eleKickDmg_pyro',
  'eleWheelDmg_cryo',
  'eleWheelDmg_electro',
  'eleWheelDmg_hydro',
  'eleWheelDmg_pyro',
  'kickHoldDmg',
  'kickPressDmg',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'pressDmg',
  'pressHeal',
  'wheelDmg',
]

const ABSORB_PYRO_LIST_INDEX = 2

function withConds(
  absorptionPyro: boolean,
  c2SkillStack: number
): ParityFixture {
  const wrSayu: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (absorptionPyro) {
    wrSayu.skillAbsorption = 'pyro'
    pandoConditionals.push({
      sheet: 'Sayu',
      src: '0',
      dst: null,
      name: 'skillAbsorption',
      value: ABSORB_PYRO_LIST_INDEX,
    })
  }
  if (c2SkillStack > 0) {
    wrSayu.c2SkillStack = String(c2SkillStack)
    pandoConditionals.push({
      sheet: 'Sayu',
      src: '0',
      dst: null,
      name: 'c2SkillStack',
      value: c2SkillStack,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Sayu: wrSayu },
    pandoConditionals,
  }
}

describe('Sayu WR ↔ Pando finals', () => {
  test.each([
    [false, 0],
    [true, 0],
    [false, 20],
    [true, 20],
  ] as const)('aligned finals (absorptionPyro=%s c2SkillStack=%s)', (absorptionPyro, c2SkillStack) => {
    const fixture =
      absorptionPyro || c2SkillStack
        ? withConds(absorptionPyro, c2SkillStack)
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
