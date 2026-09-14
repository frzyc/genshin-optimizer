/**
 * Alyosha WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * List `skillPrecision` `'1'`/`'2'` ↔ Pando 1-based index. Bool `a0StellarRadianceSc`.
 * Precision atk_/C6 eleMas are WR teamBuff dest-gated — skip `atk`/`eleMas` when on
 * (solo computeUIData does not apply WR teamBuff).
 *
 *   nx test gi-pando-parity -- alyosha.spec.ts
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
        key: 'Alyosha',
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
        location: 'Alyosha',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst_field',
  'burst_tugarin',
  'charged',
  'c4_heal',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'p1_heal',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_hold',
  'skill_press',
]

function withConds(skillPrecision: 0 | 1 | 2, a0: boolean): ParityFixture {
  const wrAlyosha: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (skillPrecision) {
    wrAlyosha.skillPrecision = String(skillPrecision)
    pandoConditionals.push({
      sheet: 'Alyosha',
      src: '0',
      dst: null,
      name: 'skillPrecision',
      value: skillPrecision,
    })
  }
  if (a0) {
    wrAlyosha.a0StellarRadianceSc = 'on'
    pandoConditionals.push({
      sheet: 'Alyosha',
      src: '0',
      dst: null,
      name: 'a0StellarRadianceSc',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Alyosha: wrAlyosha },
    pandoConditionals,
  }
}

describe('Alyosha WR ↔ Pando finals', () => {
  test.each([
    [0, false],
    [1, false],
    [2, true],
  ] as const)('aligned finals (skillPrecision=%s a0=%s)', (skillPrecision, a0) => {
    const fixture =
      skillPrecision || a0 ? withConds(skillPrecision, a0) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(
      wr,
      pando,
      skillPrecision
        ? DEFAULT_FINALS.filter((s) => s !== 'atk' && s !== 'eleMas')
        : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )
  })
})
