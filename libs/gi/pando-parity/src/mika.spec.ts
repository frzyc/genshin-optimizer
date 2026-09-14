/**
 * Mika WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Num cond `a1DetectorStacks`: Pando 0–5 ↔ WR lookup keys `'1'`…`'5'`.
 * inSoulwind / c6Crit are bool `'on'`.
 *
 * Soulwind ATK SPD / A1 physical_dmg_ / C6 physical_critDMG_ are dest-gated
 * teamBuff (WR activeCharKey). Solo computeUIData does not apply WR teamBuff;
 * Pando destIsActive teamBuff does. Those stats are not in DEFAULT_FINALS —
 * skip none; Pando atkSPD_ / dmg_.physical / critDMG_.physical are probed.
 *
 *   nx test gi-pando-parity -- mika.spec.ts
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
        key: 'Mika',
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
        location: 'Mika',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'arrowDmg',
  'castHeal',
  'charged',
  'flareDmg',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'plumeHeal',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'shardDmg',
]

const DETECTOR_PHYS_DMG_ = 0.1
const C6_PHYS_CRITDMG_ = 0.6
/** Fixture C6 includes C5 skill+3 → talent 11 → skillParam atkSPD_ index 10 */
const SKILL11_ATKSPD_ = 0.23
/** Untyped critDMG_ (50%) folds into `premod.critDMG_.physical`. */

function withConds(
  inSoulwind: boolean,
  a1DetectorStacks = 0,
  c6Crit = false
): ParityFixture {
  const wrMika: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (inSoulwind) {
    wrMika.inSoulwind = 'on'
    pandoConditionals.push({
      sheet: 'Mika',
      src: '0',
      dst: null,
      name: 'inSoulwind',
      value: 1,
    })
  }
  if (a1DetectorStacks > 0) {
    wrMika.a1DetectorStacks = String(a1DetectorStacks)
    pandoConditionals.push({
      sheet: 'Mika',
      src: '0',
      dst: null,
      name: 'a1DetectorStacks',
      value: a1DetectorStacks,
    })
  }
  if (c6Crit) {
    wrMika.c6Crit = 'on'
    pandoConditionals.push({
      sheet: 'Mika',
      src: '0',
      dst: null,
      name: 'c6Crit',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Mika: wrMika },
    pandoConditionals,
  }
}

describe('Mika WR ↔ Pando finals', () => {
  test.each([
    [false, 0, false],
    [true, 0, false],
    [true, 3, false],
    [true, 5, true],
  ] as const)('aligned finals (inSoulwind=%s a1DetectorStacks=%s c6Crit=%s)', (inSoulwind, a1DetectorStacks, c6Crit) => {
    const fixture =
      inSoulwind || a1DetectorStacks || c6Crit
        ? withConds(inSoulwind, a1DetectorStacks, c6Crit)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    // WR teamBuff (atkSPD_ / physical_dmg_ / physical_critDMG_) is hidden in
    // solo UIData; those do not move DEFAULT_FINALS.
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    const pandoAtkSpd = pando.compute(own.final.atkSPD_).val as number
    expect(pandoAtkSpd).toBeCloseTo(inSoulwind ? SKILL11_ATKSPD_ : 0)

    const physDmg_ = pando.compute(own.premod.dmg_.physical).val as number
    expect(physDmg_).toBeCloseTo(
      inSoulwind && a1DetectorStacks ? a1DetectorStacks * DETECTOR_PHYS_DMG_ : 0
    )

    const physCritDmg_ = pando.compute(own.premod.critDMG_.physical)
      .val as number
    const offPhysCritDmg_ = inSoulwind
      ? (buildPando(FIXTURE).compute(own.premod.critDMG_.physical)
          .val as number)
      : physCritDmg_
    expect(physCritDmg_).toBeCloseTo(
      offPhysCritDmg_ + (inSoulwind && c6Crit ? C6_PHYS_CRITDMG_ : 0)
    )
  })
})
