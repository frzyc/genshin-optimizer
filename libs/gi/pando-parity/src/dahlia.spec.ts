/**
 * Dahlia WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 * burstActive / c2BurstConsumed are WR teamBuff (activeCharBuff); solo
 * computeUIData does not apply them. Pando destIsActive teamBuff does.
 *
 *   nx test gi-pando-parity -- dahlia.spec.ts
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
        key: 'Dahlia',
        level: 80,
        talent: { auto: 8, skill: 8, burst: 8 },
        ascension: 6,
        constellation: 6,
      },
      weapon: {
        key: 'FavoniusSword',
        level: 90,
        ascension: 6,
        refinement: 1,
        location: 'Dahlia',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'burst_hydroShield',
  'burst_shield',
  'charged_dmg1',
  'charged_dmg2',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'normal_4',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
]

function withConds(
  burstActive: boolean,
  c2BurstConsumed: boolean
): ParityFixture {
  const wrDahlia: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (burstActive) {
    wrDahlia.burstActive = 'on'
    pandoConditionals.push({
      sheet: 'Dahlia',
      src: '0',
      dst: null,
      name: 'burstActive',
      value: 1,
    })
  }
  if (c2BurstConsumed) {
    wrDahlia.c2BurstConsumed = 'on'
    pandoConditionals.push({
      sheet: 'Dahlia',
      src: '0',
      dst: null,
      name: 'c2BurstConsumed',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Dahlia: wrDahlia },
    pandoConditionals,
  }
}

describe('Dahlia WR ↔ Pando finals', () => {
  test.each([
    [false, false],
    [true, false],
    [false, true],
    [true, true],
  ] as const)('aligned finals (burstActive=%s c2BurstConsumed=%s)', (burstActive, c2BurstConsumed) => {
    const fixture = withConds(burstActive, c2BurstConsumed)
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    const hp = pando.compute(own.final.hp).val as number
    const expectedA4 = Math.min(hp * 0.000005, 0.2)
    const pandoAtkSpd = pando.compute(own.final.atkSPD_).val as number
    expect(pandoAtkSpd).toBeCloseTo(burstActive ? expectedA4 + 0.1 : 0)

    const pandoShield_ = pando.compute(own.premod.shield_).val as number
    expect(pandoShield_).toBeCloseTo(c2BurstConsumed ? 0.25 : 0)
  })
})
