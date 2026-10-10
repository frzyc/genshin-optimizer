/**
 * Thoma WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Num cond `p1BarrierStacks`: Pando 0–5 ↔ WR lookup keys `'1'`…`'5'`.
 * `c6AfterBarrier` is bool `'on'`.
 *
 * A1 shield_ / C6 NA·CA·plunge dmg_ are WR teamBuff (whole-party, not
 * dest-gated). Solo computeUIData does not apply WR teamBuff; Pando teamBuff
 * does. Those stats are not in DEFAULT_FINALS — skip none; Pando shield_ /
 * dmg_.normal|charged|plunging are probed.
 *
 *   nx test gi-pando-parity -- thoma.spec.ts
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
        key: 'Thoma',
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
        location: 'Thoma',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst_pyroShield',
  'burst_shield',
  'charged_dmg1',
  'collapseDmg',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'pressDmg',
  'skill',
  'skill_maxPyroShield',
  'skill_maxShield',
  'skill_minPyroShield',
  'skill_minShield',
]

const A1_SHIELD_PER_STACK = 0.05
const C6_AUTO_DMG_ = 0.15

function withConds(p1BarrierStacks = 0, c6AfterBarrier = false): ParityFixture {
  const wrThoma: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (p1BarrierStacks > 0) {
    wrThoma.p1BarrierStacks = String(p1BarrierStacks)
    pandoConditionals.push({
      sheet: 'Thoma',
      src: '0',
      dst: null,
      name: 'p1BarrierStacks',
      value: p1BarrierStacks,
    })
  }
  if (c6AfterBarrier) {
    wrThoma.c6AfterBarrier = 'on'
    pandoConditionals.push({
      sheet: 'Thoma',
      src: '0',
      dst: null,
      name: 'c6AfterBarrier',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Thoma: wrThoma },
    pandoConditionals,
  }
}

describe('Thoma WR ↔ Pando finals', () => {
  test.each([
    [0, false],
    [5, false],
    [0, true],
    [5, true],
  ] as const)('aligned finals (p1BarrierStacks=%s c6AfterBarrier=%s)', (p1BarrierStacks, c6AfterBarrier) => {
    const fixture =
      p1BarrierStacks || c6AfterBarrier
        ? withConds(p1BarrierStacks, c6AfterBarrier)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    // WR teamBuff (shield_ / C6 auto dmg_) is hidden in solo UIData; those
    // do not move DEFAULT_FINALS.
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    const shield_ = pando.compute(own.premod.shield_).val as number
    expect(shield_).toBeCloseTo(p1BarrierStacks * A1_SHIELD_PER_STACK)

    const autoDmg_ = c6AfterBarrier ? C6_AUTO_DMG_ : 0
    expect(pando.compute(own.final.dmg_.normal).val as number).toBeCloseTo(
      autoDmg_
    )
    expect(pando.compute(own.final.dmg_.charged).val as number).toBeCloseTo(
      autoDmg_
    )
    expect(pando.compute(own.final.dmg_.plunging).val as number).toBeCloseTo(
      autoDmg_
    )
  })
})
