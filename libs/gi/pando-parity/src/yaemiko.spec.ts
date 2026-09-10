/**
 * YaeMiko WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bools `lockRevelation` / `lockStellarRadianceSc` / `c1`. List `c4` `'hit'`,
 * `c2` `'2'|'3'|'4'`. C3 skill / C5 burst. C2 eleMas is ownBuff + dest-gated
 * notOwnBuff — skip `eleMas` when on.
 *
 *   nx test gi-pando-parity -- yaemiko.spec.ts
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
        key: 'YaeMiko',
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
        location: 'YaeMiko',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'burst_tenko',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_2',
  'skill_3',
  'skill_4',
]

const C2_STACK4_LIST_INDEX = 3

function withConds(
  lockRevelation: boolean,
  c2: boolean,
  c4: boolean
): ParityFixture {
  const wrYae: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (lockRevelation) {
    wrYae.lockRevelation = 'on'
    pandoConditionals.push({
      sheet: 'YaeMiko',
      src: '0',
      dst: null,
      name: 'lockRevelation',
      value: 1,
    })
  }
  if (c2) {
    wrYae.c2 = '4'
    pandoConditionals.push({
      sheet: 'YaeMiko',
      src: '0',
      dst: null,
      name: 'c2',
      value: C2_STACK4_LIST_INDEX,
    })
  }
  if (c4) {
    wrYae.c4 = 'hit'
    pandoConditionals.push({
      sheet: 'YaeMiko',
      src: '0',
      dst: null,
      name: 'c4',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { YaeMiko: wrYae },
    pandoConditionals,
  }
}

describe('YaeMiko WR ↔ Pando finals', () => {
  test.each([
    [false, false, false],
    [true, false, false],
    [true, true, false],
    [false, false, true],
    [true, true, true],
  ] as const)('aligned finals (revelation=%s c2=%s c4=%s)', (lockRevelation, c2, c4) => {
    const fixture =
      lockRevelation || c2 || c4 ? withConds(lockRevelation, c2, c4) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(
      wr,
      pando,
      lockRevelation && c2
        ? DEFAULT_FINALS.filter((s) => s !== 'eleMas')
        : DEFAULT_FINALS
    )
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    if (lockRevelation && c2) {
      const off = buildPando(FIXTURE)
      expect(pando.compute(own.final.eleMas).val as number).toBeGreaterThan(
        off.compute(own.final.eleMas).val as number
      )
    }
  })
})
