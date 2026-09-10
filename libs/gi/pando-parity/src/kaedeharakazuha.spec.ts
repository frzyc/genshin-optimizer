/**
 * KaedeharaKazuha WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Lists `burstAbsorption` / `skillAbsorption`: Pando `value` is 1-based
 * absorbableEle (hydro=1, pyro=2, …). Lists `swirl${ele}` (WR value is the
 * element), `c2` / `c2p` / `c6` (WR state strings, not `'on'`).
 * C3 skill / C5 burst. C2 self eleMas is WR own premod — compared in
 * assertFinals. C2P is notOwnBuff + destIsActive. A4 ele dmg_ is teamBuff
 * (not in DEFAULT_FINALS; solo UIData hides it).
 *
 *   nx test gi-pando-parity -- kaedeharakazuha.spec.ts
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
        key: 'KaedeharaKazuha',
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
        location: 'KaedeharaKazuha',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'burst_dot',
  'charged_1',
  'charged_2',
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
  'skill_plunging_dmg',
  'skill_plunging_high',
  'skill_plunging_low',
  'skill_press',
]

const ABSORB_PYRO_LIST_INDEX = 2

function withConds(
  swirlpyro: boolean,
  burstAbsorbPyro: boolean,
  skillAbsorbPyro: boolean,
  c2: boolean,
  c2p: boolean,
  c6: boolean
): ParityFixture {
  const wrKazuha: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (swirlpyro) {
    wrKazuha.swirlpyro = 'pyro'
    pandoConditionals.push({
      sheet: 'KaedeharaKazuha',
      src: '0',
      dst: null,
      name: 'swirlpyro',
      value: 1,
    })
  }
  if (burstAbsorbPyro) {
    wrKazuha.burstAbsorption = 'pyro'
    pandoConditionals.push({
      sheet: 'KaedeharaKazuha',
      src: '0',
      dst: null,
      name: 'burstAbsorption',
      value: ABSORB_PYRO_LIST_INDEX,
    })
  }
  if (skillAbsorbPyro) {
    wrKazuha.skillAbsorption = 'pyro'
    pandoConditionals.push({
      sheet: 'KaedeharaKazuha',
      src: '0',
      dst: null,
      name: 'skillAbsorption',
      value: ABSORB_PYRO_LIST_INDEX,
    })
  }
  if (c2) {
    wrKazuha.c2 = 'c2'
    pandoConditionals.push({
      sheet: 'KaedeharaKazuha',
      src: '0',
      dst: null,
      name: 'c2',
      value: 1,
    })
  }
  if (c2p) {
    wrKazuha.c2p = 'c2p'
    pandoConditionals.push({
      sheet: 'KaedeharaKazuha',
      src: '0',
      dst: null,
      name: 'c2p',
      value: 1,
    })
  }
  if (c6) {
    wrKazuha.c6 = 'c6'
    pandoConditionals.push({
      sheet: 'KaedeharaKazuha',
      src: '0',
      dst: null,
      name: 'c6',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { KaedeharaKazuha: wrKazuha },
    pandoConditionals,
  }
}

describe('KaedeharaKazuha WR ↔ Pando finals', () => {
  test.each([
    [false, false, false, false, false, false],
    [true, false, false, false, false, false],
    [false, true, true, false, false, false],
    [false, false, false, true, false, false],
    [false, false, false, false, false, true],
    [true, true, true, true, true, true],
  ] as const)('aligned finals (swirlpyro=%s burstAbs=%s skillAbs=%s c2=%s c2p=%s c6=%s)', (swirlpyro, burstAbsorbPyro, skillAbsorbPyro, c2, c2p, c6) => {
    const anyCond =
      swirlpyro || burstAbsorbPyro || skillAbsorbPyro || c2 || c2p || c6
    const fixture = anyCond
      ? withConds(swirlpyro, burstAbsorbPyro, skillAbsorbPyro, c2, c2p, c6)
      : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (c2) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.eleMas).val as number).toBeGreaterThan(
        off.compute(own.final.eleMas).val as number
      )
    }
  })
})
