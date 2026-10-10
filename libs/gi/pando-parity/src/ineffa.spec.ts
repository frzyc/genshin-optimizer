/**
 * Ineffa WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * a4AfterBurst is WR teamBuff.total.eleMas (solo UIData hides it). Pando ownBuff
 * applies to Ineffa (dest: self OR active via destIsActive). On: skip `eleMas`.
 * A0 / C1 team lunarcharged_dmg_ are teamBuff (not in DEFAULT_FINALS).
 * A1 / C2 / C6 are WR lunarDmgNode → Pando customDmg (no lunar ×3 / transDef).
 *
 *   nx test gi-pando-parity -- ineffa.spec.ts
 */
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
        key: 'Ineffa',
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
        location: 'Ineffa',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a0_base_lc_dmg_',
  'a1',
  'a4AfterBurst_eleMasDisp',
  'burst',
  'c1AfterShield_lc_dmg_',
  'c2',
  'c6',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
  'skill_birgittaDmg',
  'skill_electroShield',
  'skill_shield',
]

function withConds(
  a4AfterBurst: boolean,
  c1AfterShield: boolean
): ParityFixture {
  const wrConditionals: NonNullable<ParityFixture['wrConditionals']> = {
    Ineffa: {},
  }
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (a4AfterBurst) {
    wrConditionals.Ineffa.a4AfterBurst = 'on'
    pandoConditionals.push({
      sheet: 'Ineffa',
      src: '0',
      dst: null,
      name: 'a4AfterBurst',
      value: 1,
    })
  }
  if (c1AfterShield) {
    wrConditionals.Ineffa.c1AfterShield = 'on'
    pandoConditionals.push({
      sheet: 'Ineffa',
      src: '0',
      dst: null,
      name: 'c1AfterShield',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals,
    pandoConditionals,
  }
}

describe('Ineffa WR ↔ Pando finals', () => {
  test.each([
    [false, false],
    [true, false],
    [false, true],
    [true, true],
  ] as const)('aligned finals (a4AfterBurst=%s c1AfterShield=%s)', (a4AfterBurst, c1AfterShield) => {
    const fixture =
      a4AfterBurst || c1AfterShield
        ? withConds(a4AfterBurst, c1AfterShield)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    // WR teamBuff.eleMas is hidden in solo UIData; Pando applies it.
    assertFinals(
      wr,
      pando,
      a4AfterBurst
        ? DEFAULT_FINALS.filter((s) => s !== 'eleMas')
        : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )
  })
})
