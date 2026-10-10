/**
 * Chevreuse WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Num cond `c6AfterHealStacks`: Pando 0–max ↔ WR `'1'`…`'N'`.
 * a1AfterOverload / a4AfterBall are bool `'on'`. C3 boosts skill; C5 burst.
 * A4 dest-gated (pyro/electro) teamBuff atk_ is hidden in solo WR UIData —
 * skip `atk` when on. A1 shred needs a pyro+electro team (solo = off).
 *
 *   nx test gi-pando-parity -- chevreuse.spec.ts
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
        key: 'Chevreuse',
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
        location: 'Chevreuse',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst_grenade',
  'burst_shell',
  'c2',
  'c6_heal',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_ball',
  'skill_blade',
  'skill_heal',
  'skill_hold',
  'skill_press',
]

function withConds(
  a1AfterOverload: boolean,
  a4AfterBall: boolean,
  c6AfterHealStacks: number
): ParityFixture {
  const wrChevreuse: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (a1AfterOverload) {
    wrChevreuse.a1AfterOverload = 'on'
    pandoConditionals.push({
      sheet: 'Chevreuse',
      src: '0',
      dst: null,
      name: 'a1AfterOverload',
      value: 1,
    })
  }
  if (a4AfterBall) {
    wrChevreuse.a4AfterBall = 'on'
    pandoConditionals.push({
      sheet: 'Chevreuse',
      src: '0',
      dst: null,
      name: 'a4AfterBall',
      value: 1,
    })
  }
  if (c6AfterHealStacks > 0) {
    wrChevreuse.c6AfterHealStacks = String(c6AfterHealStacks)
    pandoConditionals.push({
      sheet: 'Chevreuse',
      src: '0',
      dst: null,
      name: 'c6AfterHealStacks',
      value: c6AfterHealStacks,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Chevreuse: wrChevreuse },
    pandoConditionals,
  }
}

describe('Chevreuse WR ↔ Pando finals', () => {
  test.each([
    [false, false, 0],
    [true, false, 0],
    [false, true, 0],
    [false, false, 3],
    [true, true, 3],
  ] as const)('aligned finals (a1AfterOverload=%s a4AfterBall=%s c6Stacks=%s)', (a1AfterOverload, a4AfterBall, c6AfterHealStacks) => {
    const fixture =
      a1AfterOverload || a4AfterBall || c6AfterHealStacks
        ? withConds(a1AfterOverload, a4AfterBall, c6AfterHealStacks)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(
      wr,
      pando,
      a4AfterBall ? DEFAULT_FINALS.filter((s) => s !== 'atk') : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (a4AfterBall) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.premod.atk_).val as number).toBeGreaterThan(
        off.compute(own.premod.atk_).val as number
      )
    }
  })
})
