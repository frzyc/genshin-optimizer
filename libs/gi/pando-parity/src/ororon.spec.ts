/**
 * Ororon WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Num conds: `c2BurstHitStack` 0–4 ↔ WR `'1'`…`'4'`; `c6Stacks` 0–3 ↔ WR `'1'`…`'3'`.
 * c1AfterSkillHit / c2Supersense are bool `'on'`.
 * C6 dest-gated teamBuff atk_ is hidden in solo WR UIData — skip `atk` when on.
 *
 *   nx test gi-pando-parity -- ororon.spec.ts
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
        key: 'Ororon',
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
        location: 'Ororon',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a1_hypersense',
  'burst_activation',
  'burst_soundwave',
  'c6',
  'charged_aimed',
  'charged_fullyAimed',
  'normal_0',
  'normal_1',
  'normal_2',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
]

function withConds(
  c1AfterSkillHit: boolean,
  c2Supersense: boolean,
  c2BurstHitStack: number,
  c6Stacks: number
): ParityFixture {
  const wrOroron: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (c1AfterSkillHit) {
    wrOroron.c1AfterSkillHit = 'on'
    pandoConditionals.push({
      sheet: 'Ororon',
      src: '0',
      dst: null,
      name: 'c1AfterSkillHit',
      value: 1,
    })
  }
  if (c2Supersense) {
    wrOroron.c2Supersense = 'on'
    pandoConditionals.push({
      sheet: 'Ororon',
      src: '0',
      dst: null,
      name: 'c2Supersense',
      value: 1,
    })
  }
  if (c2BurstHitStack > 0) {
    wrOroron.c2BurstHitStack = String(c2BurstHitStack)
    pandoConditionals.push({
      sheet: 'Ororon',
      src: '0',
      dst: null,
      name: 'c2BurstHitStack',
      value: c2BurstHitStack,
    })
  }
  if (c6Stacks > 0) {
    wrOroron.c6Stacks = String(c6Stacks)
    pandoConditionals.push({
      sheet: 'Ororon',
      src: '0',
      dst: null,
      name: 'c6Stacks',
      value: c6Stacks,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Ororon: wrOroron },
    pandoConditionals,
  }
}

describe('Ororon WR ↔ Pando finals', () => {
  test.each([
    [false, false, 0, 0],
    [true, false, 0, 0],
    [false, true, 4, 0],
    [false, false, 0, 3],
    [true, true, 4, 3],
  ] as const)('aligned finals (c1=%s c2Supersense=%s c2Stacks=%s c6Stacks=%s)', (c1AfterSkillHit, c2Supersense, c2BurstHitStack, c6Stacks) => {
    const fixture =
      c1AfterSkillHit || c2Supersense || c2BurstHitStack || c6Stacks
        ? withConds(c1AfterSkillHit, c2Supersense, c2BurstHitStack, c6Stacks)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(
      wr,
      pando,
      c6Stacks ? DEFAULT_FINALS.filter((s) => s !== 'atk') : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (c6Stacks) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.premod.atk_).val as number).toBeGreaterThan(
        off.compute(own.premod.atk_).val as number
      )
    }
  })
})
