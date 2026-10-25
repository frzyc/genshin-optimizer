/**
 * Wriothesley WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bools `lockRevelation` / `lockStellarRadianceSc`. Num `a4EdictStacks`.
 * C3 auto / C5 burst. A4 atk_ is ownBuff. Stellar overlays skipped (Qiqi-style).
 *
 *   nx test gi-pando-parity -- wriothesley.spec.ts
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
        key: 'Wriothesley',
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
        location: 'Wriothesley',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a1_heal',
  'burst',
  'burst_blade',
  'charged',
  'charged_rebuke',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_enhanced_0',
  'skill_enhanced_1',
  'skill_enhanced_2',
  'skill_enhanced_3',
  'skill_enhanced_4',
]

function withConds(
  lockRevelation: boolean,
  lockStellarRadianceSc: boolean,
  a4EdictStacks: number
): ParityFixture {
  const wrWrio: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (lockRevelation) {
    wrWrio.lockRevelation = 'on'
    pandoConditionals.push({
      sheet: 'Wriothesley',
      src: '0',
      dst: null,
      name: 'lockRevelation',
      value: 1,
    })
  }
  if (lockStellarRadianceSc) {
    wrWrio.lockStellarRadianceSc = 'on'
    pandoConditionals.push({
      sheet: 'Wriothesley',
      src: '0',
      dst: null,
      name: 'lockStellarRadianceSc',
      value: 1,
    })
  }
  if (a4EdictStacks > 0) {
    wrWrio.a4EdictStacks = String(a4EdictStacks)
    pandoConditionals.push({
      sheet: 'Wriothesley',
      src: '0',
      dst: null,
      name: 'a4EdictStacks',
      value: a4EdictStacks,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Wriothesley: wrWrio },
    pandoConditionals,
  }
}

describe('Wriothesley WR ↔ Pando finals', () => {
  test.each([
    [false, false, 0],
    [true, false, 0],
    [false, false, 5],
    [true, true, 5],
  ] as const)('aligned finals (hex=%s stellar=%s edict=%s)', (lockRevelation, lockStellarRadianceSc, a4EdictStacks) => {
    const fixture =
      lockRevelation || lockStellarRadianceSc || a4EdictStacks
        ? withConds(lockRevelation, lockStellarRadianceSc, a4EdictStacks)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (a4EdictStacks) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.atk).val as number).toBeGreaterThan(
        off.compute(own.final.atk).val as number
      )
    }
  })
})
