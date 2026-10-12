/**
 * Aloy WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * List cond `coil`: Pando `value` is 1-based index into
 * `['coil1','coil2','coil3','rush']`. Num cond `A4`: Pando 0–10 ↔ WR `'1'`…`'10'`.
 * A1 is bool `'on'`. Rush NA is listing-local cryo (not infusionPrio).
 *
 *   nx test gi-pando-parity -- aloy.spec.ts
 */
import { own } from '@genshin-optimizer/gi/formula'
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
        key: 'Aloy',
        level: 80,
        talent: { auto: 8, skill: 8, burst: 8 },
        ascension: 6,
        constellation: 0,
      },
      weapon: {
        key: 'FavoniusWarbow',
        level: 90,
        ascension: 6,
        refinement: 1,
        location: 'Aloy',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'charged_aimed',
  'charged_aimedCharged',
  'chillWaterBomblets',
  'freezeBombDmg',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
]

const COIL_RUSH_LIST_INDEX = 4

function withConds(rush: boolean, A1: boolean, A4: number): ParityFixture {
  const wrAloy: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (rush) {
    wrAloy.coil = 'rush'
    pandoConditionals.push({
      sheet: 'Aloy',
      src: '0',
      dst: null,
      name: 'coil',
      value: COIL_RUSH_LIST_INDEX,
    })
  }
  if (A1) {
    wrAloy.A1 = 'on'
    pandoConditionals.push({
      sheet: 'Aloy',
      src: '0',
      dst: null,
      name: 'A1',
      value: 1,
    })
  }
  if (A4 > 0) {
    wrAloy.A4 = String(A4)
    pandoConditionals.push({
      sheet: 'Aloy',
      src: '0',
      dst: null,
      name: 'A4',
      value: A4,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Aloy: wrAloy },
    pandoConditionals,
  }
}

describe('Aloy WR ↔ Pando finals', () => {
  test.each([
    [false, false, 0],
    [true, false, 0],
    [false, true, 0],
    [false, false, 10],
    [true, true, 10],
  ] as const)('aligned finals (rush=%s A1=%s A4=%s)', (rush, A1, A4) => {
    const fixture = rush || A1 || A4 ? withConds(rush, A1, A4) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    // WR A1 atk_ is equal(target.charKey, Aloy); solo UIData does not match dest.
    assertFinals(
      wr,
      pando,
      A1 ? DEFAULT_FINALS.filter((s) => s !== 'atk') : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (A1) {
      expect(pando.compute(own.premod.atk_).val as number).toBeCloseTo(0.16)
    }
  })
})
