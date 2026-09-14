/**
 * Kachina WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * WR `lookup` c4Opponents (states `'1'`..`'4'`) → Pando `allNumConditionals`
 * 0–4. Fixture: WR string key ↔ Pando integer. C4 is WR teamBuff.def_;
 * solo computeUIData does not apply it. c4 on: assertFinals skips `def`;
 * Pando `def_` delta is checked instead.
 *
 *   nx test gi-pando-parity -- kachina.spec.ts
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
        key: 'Kachina',
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
        location: 'Kachina',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const C4_DEF_ = [0, 0.08, 0.12, 0.16, 0.2] as const

const EXPECTED_LISTINGS = [
  'burst',
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
  'skill_independent',
  'skill_ride',
]

function withConds(
  a1NightsoulBurst: boolean,
  c4Opponents: 0 | 4
): ParityFixture {
  const wrKachina: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (a1NightsoulBurst) {
    wrKachina.a1NightsoulBurst = 'on'
    pandoConditionals.push({
      sheet: 'Kachina',
      src: '0',
      dst: null,
      name: 'a1NightsoulBurst',
      value: 1,
    })
  }
  if (c4Opponents) {
    wrKachina.c4Opponents = String(c4Opponents)
    pandoConditionals.push({
      sheet: 'Kachina',
      src: '0',
      dst: null,
      name: 'c4Opponents',
      value: c4Opponents,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Kachina: wrKachina },
    pandoConditionals,
  }
}

describe('Kachina WR ↔ Pando finals', () => {
  test.each([
    [false, 0],
    [true, 0],
    [false, 4],
    [true, 4],
  ] as const)('aligned finals (a1NightsoulBurst=%s c4Opponents=%s)', (a1NightsoulBurst, c4Opponents) => {
    const fixture =
      a1NightsoulBurst || c4Opponents
        ? withConds(a1NightsoulBurst, c4Opponents)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    // WR teamBuff.def_ is hidden in solo UIData; Pando applies it.
    assertFinals(
      wr,
      pando,
      c4Opponents ? DEFAULT_FINALS.filter((s) => s !== 'def') : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)

    const names = pandoListingNames(pando)
    for (const name of EXPECTED_LISTINGS) {
      expect(names, name).toContain(name)
    }

    const off = buildPando(FIXTURE)
    expect(pando.compute(own.premod.dmg_.geo).val as number).toBeCloseTo(
      (off.compute(own.premod.dmg_.geo).val as number) +
        (a1NightsoulBurst ? 0.2 : 0)
    )
    expect(pando.compute(own.final.def_).val as number).toBeCloseTo(
      (off.compute(own.final.def_).val as number) + C4_DEF_[c4Opponents]
    )
  })
})
