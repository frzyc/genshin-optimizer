/**
 * Mitya WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 * Stellar talent hits are talent-style listings (no trans pipeline).
 *
 *   nx test gi-pando-parity -- mitya.spec.ts
 */
import { own } from '@genshin-optimizer/gi/formula'
import { input } from '@genshin-optimizer/gi/wr'
import { expect } from 'vitest'
import {
  assertFinals,
  assertPandoListingsFinite,
  buildPando,
  buildWrSolo,
  type ParityFixture,
  pandoListingNames,
} from './harness'
import { relDiff } from './relDiff'

const FIXTURE: ParityFixture = {
  members: [
    {
      char: {
        key: 'Mitya',
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
        location: 'Mitya',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const LISTINGS = [
  'normal_0',
  'normal_1',
  'normal_2',
  'charged',
  'charged_detonationDmg',
  'charged_detonationStellarDmg',
  'plunging_dmg',
  'plunging_low',
  'plunging_high',
  'skill_tapDmg',
  'skill_holdDmg',
  'skill_steadyDmg',
  'skill_steadyConsumptionDmg',
  'skill_steadyDetonationDmg',
  'burst_skillDmg',
  'c4',
]

function withConds(
  wr: Record<string, string | number>,
  pando: { name: string; value: number }[]
): ParityFixture {
  return {
    ...FIXTURE,
    wrConditionals: { Mitya: wr },
    pandoConditionals: pando.map(({ name, value }) => ({
      sheet: 'Mitya',
      src: '0' as const,
      dst: null,
      name,
      value,
    })),
  }
}

describe('Mitya WR ↔ Pando finals', () => {
  test('aligned finals', () => {
    const wr = buildWrSolo(FIXTURE)
    const pando = buildPando(FIXTURE)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(expect.arrayContaining(LISTINGS))
  })

  test('a4 stacks critRate_ matches WR', () => {
    const fixture = withConds({ a4Stacks: '4' }, [
      { name: 'a4Stacks', value: 4 },
    ])
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    const wrCrit = wr.get(input.total.critRate_).value as number
    const pCrit = pando.compute(own.final.critRate_).val as number
    expect(relDiff(wrCrit, pCrit)).toBeLessThan(1e-4)
    expect(pCrit).toBeGreaterThan(
      buildPando(FIXTURE).compute(own.final.critRate_).val as number
    )
  })

  test('team EM buffs land on self in Pando', () => {
    // Solo computeUIData does not apply teamBuff.
    const off = buildPando(FIXTURE)
    const on = buildPando(
      withConds({ a1Beacons: '4', c2CoreType: 'steady' }, [
        { name: 'a1Beacons', value: 4 },
        { name: 'c2CoreType', value: 1 },
      ])
    )
    expect(on.compute(own.final.eleMas).val as number).toBeGreaterThan(
      off.compute(own.final.eleMas).val as number
    )
  })
})
