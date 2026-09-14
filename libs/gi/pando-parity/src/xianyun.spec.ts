/**
 * Xianyun WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bool `a4HasStacks` / `c2AfterSkill`. Num `a1Stacks` 0–4, `c6SkyladderUses` 0–3.
 * C3 burst / C5 skill. A1 plunging critRate_ is teamBuff (not DEFAULT_FINALS).
 * C2 atk_ is ownBuff.
 *
 *   nx test gi-pando-parity -- xianyun.spec.ts
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
        key: 'Xianyun',
        level: 80,
        talent: { auto: 8, skill: 8, burst: 8 },
        ascension: 6,
        constellation: 6,
      },
      weapon: {
        key: 'FavoniusCodex',
        level: 90,
        ascension: 6,
        refinement: 1,
        location: 'Xianyun',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'burst_coord',
  'burst_deviceHeal',
  'burst_instantHeal',
  'c4_heal1',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_leap1',
  'skill_leap2',
  'skill_leap3',
  'skill_trail',
]

function withConds(
  a1Stacks: number,
  a4HasStacks: boolean,
  c2AfterSkill: boolean,
  c6SkyladderUses: number
): ParityFixture {
  const wrXianyun: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (a1Stacks > 0) {
    wrXianyun.a1Stacks = String(a1Stacks)
    pandoConditionals.push({
      sheet: 'Xianyun',
      src: '0',
      dst: null,
      name: 'a1Stacks',
      value: a1Stacks,
    })
  }
  if (a4HasStacks) {
    wrXianyun.a4HasStacks = 'on'
    pandoConditionals.push({
      sheet: 'Xianyun',
      src: '0',
      dst: null,
      name: 'a4HasStacks',
      value: 1,
    })
  }
  if (c2AfterSkill) {
    wrXianyun.c2AfterSkill = 'on'
    pandoConditionals.push({
      sheet: 'Xianyun',
      src: '0',
      dst: null,
      name: 'c2AfterSkill',
      value: 1,
    })
  }
  if (c6SkyladderUses > 0) {
    wrXianyun.c6SkyladderUses = String(c6SkyladderUses)
    pandoConditionals.push({
      sheet: 'Xianyun',
      src: '0',
      dst: null,
      name: 'c6SkyladderUses',
      value: c6SkyladderUses,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Xianyun: wrXianyun },
    pandoConditionals,
  }
}

describe('Xianyun WR ↔ Pando finals', () => {
  test.each([
    [0, false, false, 0],
    [4, false, false, 0],
    [0, true, false, 0],
    [0, false, true, 0],
    [4, true, true, 3],
  ] as const)('aligned finals (a1=%s a4=%s c2=%s c6=%s)', (a1Stacks, a4HasStacks, c2AfterSkill, c6SkyladderUses) => {
    const fixture =
      a1Stacks || a4HasStacks || c2AfterSkill || c6SkyladderUses
        ? withConds(a1Stacks, a4HasStacks, c2AfterSkill, c6SkyladderUses)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (c2AfterSkill) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.atk).val as number).toBeGreaterThan(
        off.compute(own.final.atk).val as number
      )
    }
  })
})
