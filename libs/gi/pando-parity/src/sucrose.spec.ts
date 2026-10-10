/**
 * Sucrose WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * List cond `absorption`: Pando `value` is 1-based index into absorbableEle.
 * lockHomework / skillHit / lockAfterSkill / lockAfterBurst / swirl{ele} are bool.
 * A1/A4 are notOwnBuff (WR unequal self); hexerei move dmg_ is teamBuff.
 * Those stats are not in DEFAULT_FINALS.
 *
 *   nx test gi-pando-parity -- sucrose.spec.ts
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
        key: 'Sucrose',
        level: 80,
        talent: { auto: 8, skill: 8, burst: 8 },
        ascension: 6,
        constellation: 6,
      },
      weapon: {
        key: 'FavoniusCodex',
        level: 90,
        ascension: 6,
        refinement: 1,
        location: 'Sucrose',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst_cryo',
  'burst_dot',
  'burst_electro',
  'burst_hydro',
  'burst_pyro',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
]

const ABSORB_PYRO_LIST_INDEX = 2

function withConds(
  lockHomework: boolean,
  absorptionPyro: boolean
): ParityFixture {
  const wrSucrose: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (lockHomework) {
    wrSucrose.lockHomework = 'on'
    pandoConditionals.push({
      sheet: 'Sucrose',
      src: '0',
      dst: null,
      name: 'lockHomework',
      value: 1,
    })
  }
  if (absorptionPyro) {
    wrSucrose.absorption = 'pyro'
    pandoConditionals.push({
      sheet: 'Sucrose',
      src: '0',
      dst: null,
      name: 'absorption',
      value: ABSORB_PYRO_LIST_INDEX,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Sucrose: wrSucrose },
    pandoConditionals,
  }
}

describe('Sucrose WR ↔ Pando finals', () => {
  test.each([
    [false, false],
    [true, false],
    [false, true],
    [true, true],
  ] as const)('aligned finals (lockHomework=%s absorptionPyro=%s)', (lockHomework, absorptionPyro) => {
    const fixture =
      lockHomework || absorptionPyro
        ? withConds(lockHomework, absorptionPyro)
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
