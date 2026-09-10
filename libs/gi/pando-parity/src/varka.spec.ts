/**
 * Varka WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bool `lockHomework` `'on'`. Num `a4Stacks` 1..max (WR lookup, not `'on'`).
 * Lists `c4Swirl${ele}` (WR value is the element). C3 skill / C5 burst.
 * Sturm phec hits are listing-local ele (pyro>hydro>electro>cryo>physical)
 * plus listing-local all_dmg_ from a4Stacks. Solo phec is physical.
 *
 *   nx test gi-pando-parity -- varka.spec.ts
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
        key: 'Varka',
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
        location: 'Varka',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst_dmg1',
  'burst_dmg2',
  'c1_azure1',
  'c1_azure2',
  'c1_fourWind1',
  'c1_fourWind2',
  'c2',
  'charged_1',
  'charged_2',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'normal_5',
  'normal_6',
  'normal_7',
  'normal_8',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
  'skill_azure1',
  'skill_azure2',
  'skill_ca1',
  'skill_ca2',
  'skill_fourWind1',
  'skill_fourWind2',
  'skill_na1',
  'skill_na21',
  'skill_na22',
  'skill_na31',
  'skill_na32',
  'skill_na41',
  'skill_na42',
  'skill_na51',
  'skill_na52',
]

function withConds(
  lockHomework: boolean,
  a4Stacks: number,
  c4Swirlpyro: boolean
): ParityFixture {
  const wrVarka: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (lockHomework) {
    wrVarka.lockHomework = 'on'
    pandoConditionals.push({
      sheet: 'Varka',
      src: '0',
      dst: null,
      name: 'lockHomework',
      value: 1,
    })
  }
  if (a4Stacks) {
    wrVarka.a4Stacks = String(a4Stacks)
    pandoConditionals.push({
      sheet: 'Varka',
      src: '0',
      dst: null,
      name: 'a4Stacks',
      value: a4Stacks,
    })
  }
  if (c4Swirlpyro) {
    wrVarka.c4Swirlpyro = 'pyro'
    pandoConditionals.push({
      sheet: 'Varka',
      src: '0',
      dst: null,
      name: 'c4Swirlpyro',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Varka: wrVarka },
    pandoConditionals,
  }
}

describe('Varka WR ↔ Pando finals', () => {
  test.each([
    [false, 0, false],
    [true, 0, false],
    [false, 4, false],
    [false, 0, true],
    [true, 4, true],
  ] as const)('aligned finals (lockHomework=%s a4Stacks=%s c4Swirlpyro=%s)', (lockHomework, a4Stacks, c4Swirlpyro) => {
    const fixture =
      lockHomework || a4Stacks || c4Swirlpyro
        ? withConds(lockHomework, a4Stacks, c4Swirlpyro)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (a4Stacks) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.critDMG_).val as number).toBeGreaterThan(
        off.compute(own.final.critDMG_).val as number
      )
    }
  })
})
