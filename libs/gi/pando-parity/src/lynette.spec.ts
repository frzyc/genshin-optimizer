/**
 * Lynette WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * List cond `burstAbsorb`: Pando `value` is 1-based index into absorbableEle.
 * a1AfterBurst / c6AfterThrust are bool `'on'`. C6 anemo infusion is listing-local.
 * A1 teamBuff atk_ is hidden in solo WR UIData — skip `atk` when on.
 *
 *   nx test gi-pando-parity -- lynette.spec.ts
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
        key: 'Lynette',
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
        location: 'Lynette',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'burst_box',
  'burst_shot_cryo',
  'burst_shot_electro',
  'burst_shot_hydro',
  'burst_shot_pyro',
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
  'skill_blade',
  'skill_hpRegen',
  'skill_thrust',
]

const ABSORB_PYRO_LIST_INDEX = 2

function withConds(
  burstAbsorbPyro: boolean,
  a1AfterBurst: boolean,
  c6AfterThrust: boolean
): ParityFixture {
  const wrLynette: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (burstAbsorbPyro) {
    wrLynette.burstAbsorb = 'pyro'
    pandoConditionals.push({
      sheet: 'Lynette',
      src: '0',
      dst: null,
      name: 'burstAbsorb',
      value: ABSORB_PYRO_LIST_INDEX,
    })
  }
  if (a1AfterBurst) {
    wrLynette.a1AfterBurst = 'on'
    pandoConditionals.push({
      sheet: 'Lynette',
      src: '0',
      dst: null,
      name: 'a1AfterBurst',
      value: 1,
    })
  }
  if (c6AfterThrust) {
    wrLynette.c6AfterThrust = 'on'
    pandoConditionals.push({
      sheet: 'Lynette',
      src: '0',
      dst: null,
      name: 'c6AfterThrust',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Lynette: wrLynette },
    pandoConditionals,
  }
}

describe('Lynette WR ↔ Pando finals', () => {
  test.each([
    [false, false, false],
    [true, false, false],
    [false, true, false],
    [false, false, true],
    [true, true, true],
  ] as const)('aligned finals (burstAbsorbPyro=%s a1AfterBurst=%s c6AfterThrust=%s)', (burstAbsorbPyro, a1AfterBurst, c6AfterThrust) => {
    const fixture =
      burstAbsorbPyro || a1AfterBurst || c6AfterThrust
        ? withConds(burstAbsorbPyro, a1AfterBurst, c6AfterThrust)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(
      wr,
      pando,
      a1AfterBurst ? DEFAULT_FINALS.filter((s) => s !== 'atk') : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (a1AfterBurst) {
      expect(pando.compute(own.premod.atk_).val as number).toBeGreaterThan(0)
    }
  })
})
