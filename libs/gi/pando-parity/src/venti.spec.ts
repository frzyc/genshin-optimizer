/**
 * Venti WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * List `burstAbsorption` is 1-based absorbableEle. `c2` `'hit'|'launched'`,
 * `c4` `'pickup'`, `c6` `'takeDmg'`. Bools `lockHomework` / `lockBurstSwirl` /
 * `lockC4SkillBurst`. C3 burst / C5 skill. lockC6 critDMG_ is ownBuff — skip
 * `critDMG_` when homework+c6.
 *
 *   nx test gi-pando-parity -- venti.spec.ts
 */

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
        key: 'Venti',
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
        location: 'Venti',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'c1_aimed',
  'c1_fully',
  'charged_aimed',
  'charged_fully',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'normal_5',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_hold',
  'skill_press',
]

const ABSORB_PYRO_LIST_INDEX = 2

function withConds(
  lockHomework: boolean,
  absorbPyro: boolean,
  c6: boolean
): ParityFixture {
  const wrVenti: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (lockHomework) {
    wrVenti.lockHomework = 'on'
    pandoConditionals.push({
      sheet: 'Venti',
      src: '0',
      dst: null,
      name: 'lockHomework',
      value: 1,
    })
  }
  if (absorbPyro) {
    wrVenti.burstAbsorption = 'pyro'
    pandoConditionals.push({
      sheet: 'Venti',
      src: '0',
      dst: null,
      name: 'burstAbsorption',
      value: ABSORB_PYRO_LIST_INDEX,
    })
  }
  if (c6) {
    wrVenti.c6 = 'takeDmg'
    pandoConditionals.push({
      sheet: 'Venti',
      src: '0',
      dst: null,
      name: 'c6',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Venti: wrVenti },
    pandoConditionals,
  }
}

describe('Venti WR ↔ Pando finals', () => {
  test.each([
    [false, false, false],
    [true, false, false],
    [false, true, false],
    [false, false, true],
    [true, true, true],
  ] as const)('aligned finals (homework=%s absorbPyro=%s c6=%s)', (lockHomework, absorbPyro, c6) => {
    const fixture =
      lockHomework || absorbPyro || c6
        ? withConds(lockHomework, absorbPyro, c6)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(
      wr,
      pando,
      lockHomework && c6
        ? DEFAULT_FINALS.filter((s) => s !== 'critDMG_')
        : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )
  })
})
