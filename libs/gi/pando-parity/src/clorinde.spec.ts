/**
 * Clorinde WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Num `a1Reactions` 0–3 / `a4BondChanges` 0–2 / `c4BondPercent` 0–100
 * (WR list 10..100 by 5). Bool `c6AfterSkill` `'on'`. C3 skill / C5 burst.
 *
 *   nx test gi-pando-parity -- clorinde.spec.ts
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
        key: 'Clorinde',
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
        location: 'Clorinde',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'c1',
  'c6',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_bladeDmg',
  'skill_normalDmg',
  'skill_piercingDmg',
  'skill_thrust1Dmg',
  'skill_thrust2Dmg',
  'skill_thrust3Dmg',
]

function withConds(
  a1Reactions: number,
  a4BondChanges: number,
  c4BondPercent: number,
  c6AfterSkill: boolean
): ParityFixture {
  const wrClorinde: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (a1Reactions > 0) {
    wrClorinde.a1Reactions = String(a1Reactions)
    pandoConditionals.push({
      sheet: 'Clorinde',
      src: '0',
      dst: null,
      name: 'a1Reactions',
      value: a1Reactions,
    })
  }
  if (a4BondChanges > 0) {
    wrClorinde.a4BondChanges = String(a4BondChanges)
    pandoConditionals.push({
      sheet: 'Clorinde',
      src: '0',
      dst: null,
      name: 'a4BondChanges',
      value: a4BondChanges,
    })
  }
  if (c4BondPercent > 0) {
    wrClorinde.c4BondPercent = String(c4BondPercent)
    pandoConditionals.push({
      sheet: 'Clorinde',
      src: '0',
      dst: null,
      name: 'c4BondPercent',
      value: c4BondPercent,
    })
  }
  if (c6AfterSkill) {
    wrClorinde.c6AfterSkill = 'on'
    pandoConditionals.push({
      sheet: 'Clorinde',
      src: '0',
      dst: null,
      name: 'c6AfterSkill',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Clorinde: wrClorinde },
    pandoConditionals,
  }
}

describe('Clorinde WR ↔ Pando finals', () => {
  test.each([
    [0, 0, 0, false],
    [3, 0, 0, false],
    [0, 2, 0, false],
    [0, 0, 100, false],
    [0, 0, 0, true],
    [3, 2, 100, true],
  ] as const)('aligned finals (a1=%s a4=%s c4=%s c6=%s)', (a1Reactions, a4BondChanges, c4BondPercent, c6AfterSkill) => {
    const fixture =
      a1Reactions || a4BondChanges || c4BondPercent || c6AfterSkill
        ? withConds(a1Reactions, a4BondChanges, c4BondPercent, c6AfterSkill)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (a4BondChanges || c6AfterSkill) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.critRate_).val as number).toBeGreaterThan(
        off.compute(own.final.critRate_).val as number
      )
    }
    if (c6AfterSkill) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.critDMG_).val as number).toBeGreaterThan(
        off.compute(own.final.critDMG_).val as number
      )
    }
  })
})
