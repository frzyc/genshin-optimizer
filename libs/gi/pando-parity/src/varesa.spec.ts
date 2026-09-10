/**
 * Varesa WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bools `a1Rainbow` / `c4Diligent` / `c4FpApex` are `'on'`. Num `a4NsBurst`
 * 0–2 ↔ WR `'1'`/`'2'`. C3 burst / C5 auto. Catalyst; WR has no infusion.
 * A4 atk_ is ownBuff (solo computeUIData applies it).
 *
 *   nx test gi-pando-parity -- varesa.spec.ts
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
        key: 'Varesa',
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
        location: 'Varesa',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a1Rainbow_fpImpact_dmgInc',
  'a1Rainbow_impact_dmgInc',
  'burst_fpKickDmg',
  'burst_kickDmg',
  'burst_volcanoDmg',
  'c4Diligent_impact_dmgInc',
  'charged_dmg',
  'charged_fpDmg',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_fp0',
  'normal_fp1',
  'normal_fp2',
  'plunging_dmg',
  'plunging_fpdmg',
  'plunging_fphigh',
  'plunging_fplow',
  'plunging_high',
  'plunging_low',
  'skill_fpRushDmg',
  'skill_rushDmg',
]

function withConds(
  a1Rainbow: boolean,
  a4NsBurst: number,
  c4Diligent: boolean,
  c4FpApex: boolean
): ParityFixture {
  const wrVaresa: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (a1Rainbow) {
    wrVaresa.a1Rainbow = 'on'
    pandoConditionals.push({
      sheet: 'Varesa',
      src: '0',
      dst: null,
      name: 'a1Rainbow',
      value: 1,
    })
  }
  if (a4NsBurst > 0) {
    wrVaresa.a4NsBurst = String(a4NsBurst)
    pandoConditionals.push({
      sheet: 'Varesa',
      src: '0',
      dst: null,
      name: 'a4NsBurst',
      value: a4NsBurst,
    })
  }
  if (c4Diligent) {
    wrVaresa.c4Diligent = 'on'
    pandoConditionals.push({
      sheet: 'Varesa',
      src: '0',
      dst: null,
      name: 'c4Diligent',
      value: 1,
    })
  }
  if (c4FpApex) {
    wrVaresa.c4FpApex = 'on'
    pandoConditionals.push({
      sheet: 'Varesa',
      src: '0',
      dst: null,
      name: 'c4FpApex',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Varesa: wrVaresa },
    pandoConditionals,
  }
}

describe('Varesa WR ↔ Pando finals', () => {
  test.each([
    [false, 0, false, false],
    [true, 0, false, false],
    [false, 2, false, false],
    [false, 0, true, false],
    [false, 0, false, true],
    [true, 2, true, true],
  ] as const)('aligned finals (a1Rainbow=%s a4NsBurst=%s c4Diligent=%s c4FpApex=%s)', (a1Rainbow, a4NsBurst, c4Diligent, c4FpApex) => {
    const fixture =
      a1Rainbow || a4NsBurst || c4Diligent || c4FpApex
        ? withConds(a1Rainbow, a4NsBurst, c4Diligent, c4FpApex)
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
