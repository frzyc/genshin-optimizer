/**
 * Kaveh WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Num cond `a4Stacks`: Pando 0–4 ↔ WR lookup keys `'1'`…`'4'`.
 * afterBurst / c1AfterSkill are bool `'on'`.
 *
 * Burst dendro infusion is listing-local `{ ele: 'dendro' }` (infusionPrio has
 * no dendro). Bloom dmg_ is teamBuff — not in DEFAULT_FINALS. A4 eleMas is
 * ownBuff so both engines apply it.
 *
 *   nx test gi-pando-parity -- kaveh.spec.ts
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
        key: 'Kaveh',
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
        location: 'Kaveh',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a1Heal',
  'burst',
  'c6',
  'charged_final',
  'charged_spin',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
]

function withConds(
  afterBurst: boolean,
  a4Stacks: number,
  c1AfterSkill: boolean
): ParityFixture {
  const wrKaveh: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (afterBurst) {
    wrKaveh.afterBurst = 'on'
    pandoConditionals.push({
      sheet: 'Kaveh',
      src: '0',
      dst: null,
      name: 'afterBurst',
      value: 1,
    })
  }
  if (a4Stacks > 0) {
    wrKaveh.a4Stacks = String(a4Stacks)
    pandoConditionals.push({
      sheet: 'Kaveh',
      src: '0',
      dst: null,
      name: 'a4Stacks',
      value: a4Stacks,
    })
  }
  if (c1AfterSkill) {
    wrKaveh.c1AfterSkill = 'on'
    pandoConditionals.push({
      sheet: 'Kaveh',
      src: '0',
      dst: null,
      name: 'c1AfterSkill',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Kaveh: wrKaveh },
    pandoConditionals,
  }
}

describe('Kaveh WR ↔ Pando finals', () => {
  test.each([
    [false, 0, false],
    [true, 0, false],
    [true, 4, false],
    [false, 0, true],
    [true, 4, true],
  ] as const)('aligned finals (afterBurst=%s a4Stacks=%s c1AfterSkill=%s)', (afterBurst, a4Stacks, c1AfterSkill) => {
    const fixture =
      afterBurst || a4Stacks || c1AfterSkill
        ? withConds(afterBurst, a4Stacks, c1AfterSkill)
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
