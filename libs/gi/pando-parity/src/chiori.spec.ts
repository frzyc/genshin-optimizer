/**
 * Chiori WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bools `a1Infusion` / `a4Construct`. C3 skill / C5 burst. A4 geo_dmg_ is
 * ownBuff (not in DEFAULT_FINALS). A1 geo infusion is listing-local.
 *
 *   nx test gi-pando-parity -- chiori.spec.ts
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
        key: 'Chiori',
        level: 80,
        talent: { auto: 8, skill: 8, burst: 8 },
        ascension: 6,
        constellation: 6,
      },
      weapon: {
        key: 'FavoniusSword',
        level: 90,
        ascension: 6,
        refinement: 1,
        location: 'Chiori',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'bloomDmg',
  'c2_dollDmg',
  'c6_normal_dmgInc',
  'charged',
  'dollDmg',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'sweepDmg',
  'turretDmg',
]

function withConds(a1Infusion: boolean, a4Construct: boolean): ParityFixture {
  const wrConditionals: NonNullable<ParityFixture['wrConditionals']> = {
    Chiori: {},
  }
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (a1Infusion) {
    wrConditionals.Chiori.a1Infusion = 'on'
    pandoConditionals.push({
      sheet: 'Chiori',
      src: '0',
      dst: null,
      name: 'a1Infusion',
      value: 1,
    })
  }
  if (a4Construct) {
    wrConditionals.Chiori.a4Construct = 'on'
    pandoConditionals.push({
      sheet: 'Chiori',
      src: '0',
      dst: null,
      name: 'a4Construct',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals,
    pandoConditionals,
  }
}

describe('Chiori WR ↔ Pando finals', () => {
  test.each([
    [false, false],
    [true, false],
    [false, true],
    [true, true],
  ] as const)('aligned finals (a1Infusion=%s a4Construct=%s)', (a1Infusion, a4Construct) => {
    const fixture = withConds(a1Infusion, a4Construct)
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    const off = buildPando(FIXTURE)
    expect(pando.compute(own.premod.dmg_.geo).val as number).toBeCloseTo(
      (off.compute(own.premod.dmg_.geo).val as number) + (a4Construct ? 0.2 : 0)
    )
  })
})
