/**
 * Xiao WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * List `inBurst` / `c4BelowHP` — Pando `value: 1` ↔ WR state string.
 * List `a1BurstStack` `['0','1','2','3','4']` — Pando 1-based index.
 * Num `a4SkillStack` 0–max ↔ WR `'1'`…`'N'`. Bool `offField`. C3 skill / C5 burst.
 * Burst anemo infusion is listing-local. C2 enerRech_ and C4 def_ are ownBuff.
 *
 *   nx test gi-pando-parity -- xiao.spec.ts
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
        key: 'Xiao',
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
        location: 'Xiao',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
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
  'skill',
]

/** WR `'4'` — 1-based index into `['0','1','2','3','4']`. */
const A1_STACK_4_LIST_INDEX = 5

function withConds(
  inBurst: boolean,
  offField: boolean,
  c4BelowHP: boolean,
  a4SkillStack: number
): ParityFixture {
  const wrXiao: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (inBurst) {
    wrXiao.inBurst = 'inBurst'
    wrXiao.a1BurstStack = '4'
    pandoConditionals.push(
      {
        sheet: 'Xiao',
        src: '0',
        dst: null,
        name: 'inBurst',
        value: 1,
      },
      {
        sheet: 'Xiao',
        src: '0',
        dst: null,
        name: 'a1BurstStack',
        value: A1_STACK_4_LIST_INDEX,
      }
    )
  }
  if (offField) {
    wrXiao.offField = 'on'
    pandoConditionals.push({
      sheet: 'Xiao',
      src: '0',
      dst: null,
      name: 'offField',
      value: 1,
    })
  }
  if (c4BelowHP) {
    wrXiao.c4BelowHP = 'c4BelowHP'
    pandoConditionals.push({
      sheet: 'Xiao',
      src: '0',
      dst: null,
      name: 'c4BelowHP',
      value: 1,
    })
  }
  if (a4SkillStack > 0) {
    wrXiao.a4SkillStack = String(a4SkillStack)
    pandoConditionals.push({
      sheet: 'Xiao',
      src: '0',
      dst: null,
      name: 'a4SkillStack',
      value: a4SkillStack,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Xiao: wrXiao },
    pandoConditionals,
  }
}

describe('Xiao WR ↔ Pando finals', () => {
  test.each([
    [false, false, false, 0],
    [true, false, false, 0],
    [false, true, false, 0],
    [false, false, true, 0],
    [true, true, true, 3],
  ] as const)('aligned finals (inBurst=%s offField=%s c4=%s a4=%s)', (inBurst, offField, c4BelowHP, a4SkillStack) => {
    const fixture =
      inBurst || offField || c4BelowHP || a4SkillStack
        ? withConds(inBurst, offField, c4BelowHP, a4SkillStack)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (offField) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.enerRech_).val as number).toBeGreaterThan(
        off.compute(own.final.enerRech_).val as number
      )
    }
    if (c4BelowHP) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.def).val as number).toBeGreaterThan(
        off.compute(own.final.def).val as number
      )
    }
  })
})
