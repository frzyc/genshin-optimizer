/**
 * Neuvillette WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Num `a1Stacks` 0–3 ↔ WR `'1'`…`'3'`. Num `a4Hp` 0–50 ↔ WR `'1'`…`'50'`.
 * C3 auto / C5 burst. A4 hydro_dmg_ is ownBuff (not DEFAULT_FINALS).
 * C2 charged_critDMG_ is name-scoped on judgment / C6.
 *
 *   nx test gi-pando-parity -- neuvillette.spec.ts
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
        key: 'Neuvillette',
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
        location: 'Neuvillette',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'burst_waterfall',
  'c6',
  'charged',
  'charged_hpRestore',
  'charged_judgment',
  'normal_0',
  'normal_1',
  'normal_2',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
  'skill_thorn',
]

function withConds(a1Stacks: number, a4Hp: number): ParityFixture {
  const wrNeuvillette: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (a1Stacks > 0) {
    wrNeuvillette.a1Stacks = String(a1Stacks)
    pandoConditionals.push({
      sheet: 'Neuvillette',
      src: '0',
      dst: null,
      name: 'a1Stacks',
      value: a1Stacks,
    })
  }
  if (a4Hp > 0) {
    wrNeuvillette.a4Hp = String(a4Hp)
    pandoConditionals.push({
      sheet: 'Neuvillette',
      src: '0',
      dst: null,
      name: 'a4Hp',
      value: a4Hp,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Neuvillette: wrNeuvillette },
    pandoConditionals,
  }
}

describe('Neuvillette WR ↔ Pando finals', () => {
  test.each([
    [0, 0],
    [3, 0],
    [0, 50],
    [3, 50],
  ] as const)('aligned finals (a1Stacks=%s a4Hp=%s)', (a1Stacks, a4Hp) => {
    const fixture = a1Stacks || a4Hp ? withConds(a1Stacks, a4Hp) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (a4Hp) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.dmg_.hydro).val as number).toBeGreaterThan(
        off.compute(own.final.dmg_.hydro).val as number
      )
    }
  })
})
