/**
 * Zhongli WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bool cond `skill` (Jade Shield RES shred). Num cond `p1`: Pando 0–5 ↔ WR
 * lookup keys `'1'`…`'5'`. A1 shield_ is WR teamBuff (whole-party). Skill RES
 * is WR teamBuff `*_enemyRes_`; Pando writes `enemyDebuff.common.preRes`.
 * Solo computeUIData does not apply WR teamBuff; those are not in DEFAULT_FINALS.
 *
 * C3 Dominus Lapidis (skill +3); C5 Planet Befall (burst +3).
 *
 *   nx test gi-pando-parity -- zhongli.spec.ts
 */
import { enemy, own } from '@genshin-optimizer/gi/formula'
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
        key: 'Zhongli',
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
        location: 'Zhongli',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'c6_heal',
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
  'skill_holdDMG',
  'skill_resonance',
  'skill_shield',
  'skill_stele',
]

const A1_SHIELD_PER_STACK = 0.05
const JADE_SHIELD_RES_ = -0.2

function withConds(skillOn: boolean, p1Stacks = 0): ParityFixture {
  const wrZhongli: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (skillOn) {
    wrZhongli.skill = 'on'
    pandoConditionals.push({
      sheet: 'Zhongli',
      src: '0',
      dst: null,
      name: 'skill',
      value: 1,
    })
  }
  if (p1Stacks > 0) {
    wrZhongli.p1 = String(p1Stacks)
    pandoConditionals.push({
      sheet: 'Zhongli',
      src: '0',
      dst: null,
      name: 'p1',
      value: p1Stacks,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Zhongli: wrZhongli },
    pandoConditionals,
  }
}

describe('Zhongli WR ↔ Pando finals', () => {
  test.each([
    [false, 0],
    [true, 0],
    [false, 5],
    [true, 5],
  ] as const)('aligned finals (skill=%s p1=%s)', (skillOn, p1Stacks) => {
    const fixture = skillOn || p1Stacks ? withConds(skillOn, p1Stacks) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    const shield_ = pando.compute(own.premod.shield_).val as number
    expect(shield_).toBeCloseTo(p1Stacks * A1_SHIELD_PER_STACK)

    const expectedRes = 0.1 + (skillOn ? JADE_SHIELD_RES_ : 0)
    expect(pando.compute(enemy.common.preRes.geo).val as number).toBeCloseTo(
      expectedRes
    )
    expect(
      pando.compute(enemy.common.preRes.physical).val as number
    ).toBeCloseTo(expectedRes)
  })
})
