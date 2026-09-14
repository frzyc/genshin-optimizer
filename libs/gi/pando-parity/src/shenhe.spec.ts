/**
 * Shenhe WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * List `quill` / `burst` / `asc1` `'field'` / `asc4` `'press'` / `asc4Hold`
 * `'hold'`. Num `c4` 0–max. C3 skill / C5 burst. C2 cryo_critDMG_ is dest-gated
 * teamBuff — skip `critDMG_` when asc1 is on.
 *
 *   nx test gi-pando-parity -- shenhe.spec.ts
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
        key: 'Shenhe',
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
        location: 'Shenhe',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'burst_dot',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_hold',
  'skill_press',
]

function withConds(
  quill: boolean,
  burst: boolean,
  asc1: boolean,
  c4: number
): ParityFixture {
  const wrShenhe: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (quill) {
    wrShenhe.quill = 'quill'
    pandoConditionals.push({
      sheet: 'Shenhe',
      src: '0',
      dst: null,
      name: 'quill',
      value: 1,
    })
  }
  if (burst) {
    wrShenhe.burst = 'burst'
    pandoConditionals.push({
      sheet: 'Shenhe',
      src: '0',
      dst: null,
      name: 'burst',
      value: 1,
    })
  }
  if (asc1) {
    wrShenhe.asc1 = 'field'
    pandoConditionals.push({
      sheet: 'Shenhe',
      src: '0',
      dst: null,
      name: 'asc1',
      value: 1,
    })
  }
  if (c4 > 0) {
    wrShenhe.c4 = String(c4)
    pandoConditionals.push({
      sheet: 'Shenhe',
      src: '0',
      dst: null,
      name: 'c4',
      value: c4,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Shenhe: wrShenhe },
    pandoConditionals,
  }
}

describe('Shenhe WR ↔ Pando finals', () => {
  test.each([
    [false, false, false, 0],
    [true, false, false, 0],
    [false, true, false, 0],
    [false, false, true, 0],
    [true, true, true, 4],
  ] as const)('aligned finals (quill=%s burst=%s asc1=%s c4=%s)', (quill, burst, asc1, c4) => {
    const fixture =
      quill || burst || asc1 || c4 ? withConds(quill, burst, asc1, c4) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(
      wr,
      pando,
      asc1 ? DEFAULT_FINALS.filter((s) => s !== 'critDMG_') : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )
  })
})
