/**
 * Dori WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * List conds: `c4BelowHp` `['belowHp']` / `c4BelowEner` `['belowEner']` —
 * Pando `value: 1` ↔ WR `'belowHp'` / `'belowEner'` (not `'on'`).
 * c6AfterSkill is bool `'on'`. C6 electro infusion is listing-local.
 * C4 dest-gated teamBuff enerRech_ is hidden in solo WR UIData — skip when on.
 *
 *   nx test gi-pando-parity -- dori.spec.ts
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
        key: 'Dori',
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
        location: 'Dori',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a4_energyRegen',
  'burst_connector',
  'burst_heal',
  'c2',
  'charged_final',
  'charged_spin',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_round',
  'skill_shot',
]

function withConds(
  c4BelowHp: boolean,
  c4BelowEner: boolean,
  c6AfterSkill: boolean
): ParityFixture {
  const wrDori: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (c4BelowHp) {
    wrDori.c4BelowHp = 'belowHp'
    pandoConditionals.push({
      sheet: 'Dori',
      src: '0',
      dst: null,
      name: 'c4BelowHp',
      value: 1,
    })
  }
  if (c4BelowEner) {
    wrDori.c4BelowEner = 'belowEner'
    pandoConditionals.push({
      sheet: 'Dori',
      src: '0',
      dst: null,
      name: 'c4BelowEner',
      value: 1,
    })
  }
  if (c6AfterSkill) {
    wrDori.c6AfterSkill = 'on'
    pandoConditionals.push({
      sheet: 'Dori',
      src: '0',
      dst: null,
      name: 'c6AfterSkill',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Dori: wrDori },
    pandoConditionals,
  }
}

describe('Dori WR ↔ Pando finals', () => {
  test.each([
    [false, false, false],
    [true, false, false],
    [false, true, false],
    [false, false, true],
    [true, true, true],
  ] as const)('aligned finals (c4BelowHp=%s c4BelowEner=%s c6AfterSkill=%s)', (c4BelowHp, c4BelowEner, c6AfterSkill) => {
    const fixture =
      c4BelowHp || c4BelowEner || c6AfterSkill
        ? withConds(c4BelowHp, c4BelowEner, c6AfterSkill)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(
      wr,
      pando,
      c4BelowEner
        ? DEFAULT_FINALS.filter((s) => s !== 'enerRech_')
        : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (c4BelowEner) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.premod.enerRech_).val as number).toBeGreaterThan(
        off.compute(own.premod.enerRech_).val as number
      )
    }
    if (c4BelowHp) {
      expect(pando.compute(own.premod.incHeal_).val as number).toBeGreaterThan(
        0
      )
    }
  })
})
