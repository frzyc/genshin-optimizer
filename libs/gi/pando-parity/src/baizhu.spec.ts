/**
 * Baizhu WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 * a1HpStatus list: Pando value 1 = WR 'below', 2 = WR 'above' (0 = unset).
 * A1 is ownBuff heal_/dendro_dmg_ (not in DEFAULT_FINALS).
 * A4 is WR teamBuff reaction dmg_ (not in DEFAULT_FINALS).
 * C4 is WR teamBuff eleMas; solo computeUIData does not apply it.
 * c4AfterBurst on: assertFinals skips `eleMas`; Pando eleMas delta is checked instead.
 *
 *   nx test gi-pando-parity -- baizhu.spec.ts
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
        key: 'Baizhu',
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
        location: 'Baizhu',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'burst_dendroShield',
  'burst_heal',
  'burst_shield',
  'c2',
  'c2_heal',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'passive3_heal',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
  'skill_heal',
]

type A1HpStatus = 'below' | 'above'

function withConds(
  a1?: A1HpStatus,
  a4AfterHeal = false,
  c4AfterBurst = false
): ParityFixture {
  const wrBaizhu: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (a1) {
    wrBaizhu.a1HpStatus = a1
    pandoConditionals.push({
      sheet: 'Baizhu',
      src: '0',
      dst: null,
      name: 'a1HpStatus',
      value: a1 === 'below' ? 1 : 2,
    })
  }
  if (a4AfterHeal) {
    wrBaizhu.a4AfterHeal = 'on'
    pandoConditionals.push({
      sheet: 'Baizhu',
      src: '0',
      dst: null,
      name: 'a4AfterHeal',
      value: 1,
    })
  }
  if (c4AfterBurst) {
    wrBaizhu.c4AfterBurst = 'on'
    pandoConditionals.push({
      sheet: 'Baizhu',
      src: '0',
      dst: null,
      name: 'c4AfterBurst',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Baizhu: wrBaizhu },
    pandoConditionals,
  }
}

describe('Baizhu WR ↔ Pando finals', () => {
  test.each([
    [undefined, false, false],
    ['below', false, false],
    ['above', false, false],
    [undefined, true, false],
    [undefined, false, true],
    ['above', true, true],
  ] as const)('aligned finals (a1HpStatus=%s a4AfterHeal=%s c4AfterBurst=%s)', (a1, a4AfterHeal, c4AfterBurst) => {
    const fixture =
      a1 || a4AfterHeal || c4AfterBurst
        ? withConds(a1, a4AfterHeal, c4AfterBurst)
        : FIXTURE
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
        (off.compute(own.final.eleMas).val as number) + 80
      )
    }
  })
})
