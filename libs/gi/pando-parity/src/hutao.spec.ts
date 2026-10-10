/**
 * HuTao WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bools `GuideToAfterlifeVoyage` / `SanguineRouge` are `'on'`. FlutterBy / C4
 * are notOwnBuff critRate_ (self finals OK). Afterlife ATK conversion is own
 * premod.atk. C3 skill / C5 burst.
 *
 *   nx test gi-pando-parity -- hutao.spec.ts
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
        key: 'HuTao',
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
        location: 'HuTao',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'burst_lowHp',
  'burst_lowHpRegen',
  'burst_regen',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'normal_5',
  'normal_6',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
  'skill_atk',
]

function withConds(afterlife: boolean, sanguineRouge: boolean): ParityFixture {
  const wrHuTao: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (afterlife) {
    wrHuTao.GuideToAfterlifeVoyage = 'on'
    pandoConditionals.push({
      sheet: 'HuTao',
      src: '0',
      dst: null,
      name: 'GuideToAfterlifeVoyage',
      value: 1,
    })
  }
  if (sanguineRouge) {
    wrHuTao.SanguineRouge = 'on'
    pandoConditionals.push({
      sheet: 'HuTao',
      src: '0',
      dst: null,
      name: 'SanguineRouge',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { HuTao: wrHuTao },
    pandoConditionals,
  }
}

describe('HuTao WR ↔ Pando finals', () => {
  test.each([
    [false, false],
    [true, false],
    [false, true],
    [true, true],
  ] as const)('aligned finals (afterlife=%s A4=%s)', (afterlife, sanguineRouge) => {
    const fixture =
      afterlife || sanguineRouge ? withConds(afterlife, sanguineRouge) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (afterlife) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.atk).val as number).toBeGreaterThan(
        off.compute(own.final.atk).val as number
      )
    }
  })
})
