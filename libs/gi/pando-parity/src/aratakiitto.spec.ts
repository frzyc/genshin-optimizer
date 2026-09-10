/**
 * AratakiItto WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bools `burst` / `constellation4` are `'on'`. Num `passive1` 0–3 ↔ WR `'1'`…`'3'`.
 * C3 skill / C5 burst. C4 atk_/def_ are WR teamBuff — skip `atk` and `def` when
 * on (solo computeUIData does not apply WR teamBuff; Pando teamBuff does).
 *
 *   nx test gi-pando-parity -- aratakiitto.spec.ts
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
        key: 'AratakiItto',
        level: 80,
        talent: { auto: 8, skill: 8, burst: 8 },
        ascension: 6,
        constellation: 6,
      },
      weapon: {
        key: 'FavoniusGreatsword',
        level: 90,
        ascension: 6,
        refinement: 1,
        location: 'AratakiItto',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst_atkFromDef',
  'charged_akFinal',
  'charged_akSlash',
  'charged_sSlash',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
  'skill_hp',
]

function withConds(
  burst: boolean,
  passive1: number,
  constellation4: boolean
): ParityFixture {
  const wrItto: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (burst) {
    wrItto.burst = 'on'
    pandoConditionals.push({
      sheet: 'AratakiItto',
      src: '0',
      dst: null,
      name: 'burst',
      value: 1,
    })
  }
  if (passive1 > 0) {
    wrItto.passive1 = String(passive1)
    pandoConditionals.push({
      sheet: 'AratakiItto',
      src: '0',
      dst: null,
      name: 'passive1',
      value: passive1,
    })
  }
  if (constellation4) {
    wrItto.constellation4 = 'on'
    pandoConditionals.push({
      sheet: 'AratakiItto',
      src: '0',
      dst: null,
      name: 'constellation4',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { AratakiItto: wrItto },
    pandoConditionals,
  }
}

describe('AratakiItto WR ↔ Pando finals', () => {
  test.each([
    [false, 0, false],
    [true, 0, false],
    [false, 3, false],
    [false, 0, true],
    [true, 3, true],
  ] as const)('aligned finals (burst=%s passive1=%s constellation4=%s)', (burst, passive1, constellation4) => {
    const fixture =
      burst || passive1 || constellation4
        ? withConds(burst, passive1, constellation4)
        : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    // WR teamBuff.atk_/def_ is hidden in solo UIData; Pando applies it.
    assertFinals(
      wr,
      pando,
      constellation4
        ? DEFAULT_FINALS.filter((s) => s !== 'atk' && s !== 'def')
        : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )
  })
})
