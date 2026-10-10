/**
 * LanYan WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 * C4 is WR teamBuff eleMas; solo computeUIData does not apply it.
 * c4AfterBurst on: assertFinals skips `eleMas`; Pando eleMas delta is checked instead.
 *
 *   nx test gi-pando-parity -- lanyan.spec.ts
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
        key: 'LanYan',
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
        location: 'LanYan',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a1_cryo',
  'a1_electro',
  'a1_hydro',
  'a1_pyro',
  'burst',
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
  'skill',
  'skill_anemoShield',
  'skill_shield',
]

function withC4(c4AfterBurst: boolean): ParityFixture {
  if (!c4AfterBurst) return FIXTURE
  return {
    ...FIXTURE,
    wrConditionals: { LanYan: { c4AfterBurst: 'on' } },
    pandoConditionals: [
      {
        sheet: 'LanYan',
        src: '0',
        dst: null,
        name: 'c4AfterBurst',
        value: 1,
      },
    ],
  }
}

describe('LanYan WR ↔ Pando finals', () => {
  test.each([
    false,
    true,
  ])('aligned finals (c4AfterBurst=%s)', (c4AfterBurst) => {
    const fixture = withC4(c4AfterBurst)
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    // WR teamBuff.eleMas is hidden in solo UIData; Pando applies it.
    assertFinals(
      wr,
      pando,
      c4AfterBurst
        ? DEFAULT_FINALS.filter((s) => s !== 'eleMas')
        : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (c4AfterBurst) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.eleMas).val as number).toBeCloseTo(
        (off.compute(own.final.eleMas).val as number) + 60
      )
    }
  })
})
