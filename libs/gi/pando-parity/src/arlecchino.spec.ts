/**
 * Arlecchino WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * List `bondPercent` `['10','15',…,'200']` — Pando `value` is 1-based
 * (WR `'200'` → 39). Bools `c2AfterAbsorb` / `c6AfterSkill` are `'on'`.
 * C3 auto / C5 burst. Infusion is infusionPrio.nonOverridable.pyro when
 * bond ≥ 30% (not listing-local). C6 CR/CD are move-scoped (not DEFAULT_FINALS).
 *
 *   nx test gi-pando-parity -- arlecchino.spec.ts
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
        key: 'Arlecchino',
        level: 80,
        talent: { auto: 8, skill: 8, burst: 8 },
        ascension: 6,
        constellation: 6,
      },
      weapon: {
        key: 'FavoniusLance',
        level: 90,
        ascension: 6,
        refinement: 1,
        location: 'Arlecchino',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

/** WR `'200'` — 1-based index into range(10, 200, 5).map(String). */
const BOND_PERCENT_200_LIST_INDEX = 39

const EXPECTED_LISTINGS = [
  'bloodfireDmg',
  'burst',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'normal_5',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_finalDmg',
  'skill_sigilDmg',
  'skill_spikeDmg',
]

function withConds(
  bondPercent200: boolean,
  c2AfterAbsorb: boolean,
  c6AfterSkill: boolean
): ParityFixture {
  const wrArlecchino: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (bondPercent200) {
    wrArlecchino.bondPercent = '200'
    pandoConditionals.push({
      sheet: 'Arlecchino',
      src: '0',
      dst: null,
      name: 'bondPercent',
      value: BOND_PERCENT_200_LIST_INDEX,
    })
  }
  if (c2AfterAbsorb) {
    wrArlecchino.c2AfterAbsorb = 'on'
    pandoConditionals.push({
      sheet: 'Arlecchino',
      src: '0',
      dst: null,
      name: 'c2AfterAbsorb',
      value: 1,
    })
  }
  if (c6AfterSkill) {
    wrArlecchino.c6AfterSkill = 'on'
    pandoConditionals.push({
      sheet: 'Arlecchino',
      src: '0',
      dst: null,
      name: 'c6AfterSkill',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Arlecchino: wrArlecchino },
    pandoConditionals,
  }
}

describe('Arlecchino WR ↔ Pando finals', () => {
  test.each([
    [false, false, false],
    [true, false, false],
    [false, true, false],
    [false, false, true],
    [true, true, true],
  ] as const)('aligned finals (bond200=%s c2=%s c6=%s)', (bondPercent200, c2AfterAbsorb, c6AfterSkill) => {
    const fixture =
      bondPercent200 || c2AfterAbsorb || c6AfterSkill
        ? withConds(bondPercent200, c2AfterAbsorb, c6AfterSkill)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (c2AfterAbsorb) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.premod.res_.pyro).val as number).toBeGreaterThan(
        off.compute(own.premod.res_.pyro).val as number
      )
    }
    if (c6AfterSkill) {
      const off = buildPando(FIXTURE)
      expect(
        pando.compute(own.premod.critRate_.normal).val as number
      ).toBeGreaterThan(off.compute(own.premod.critRate_.normal).val as number)
      expect(
        pando.compute(own.premod.critDMG_.burst).val as number
      ).toBeGreaterThan(off.compute(own.premod.critDMG_.burst).val as number)
    }
  })
})
