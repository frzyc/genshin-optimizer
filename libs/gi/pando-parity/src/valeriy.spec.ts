/**
 * Valeriy WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 *   nx test gi-pando-parity -- valeriy.spec.ts
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
        key: 'Valeriy',
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
        location: 'Valeriy',
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
  'charged_mortarDmg',
  'plunging_dmg',
  'plunging_low',
  'plunging_high',
  'skill',
  'skill_shield',
  'skill_shield_electro',
  'burst_skillDmg',
  'burst_shellDmg',
]

function withConds(
  wr: Record<string, string | number>,
  pando: { name: string; value: number }[]
): ParityFixture {
  return {
    ...FIXTURE,
    wrConditionals: { Valeriy: wr },
    pandoConditionals: pando.map(({ name, value }) => ({
      sheet: 'Valeriy',
      src: '0' as const,
      dst: null,
      name,
      value,
    })),
  }
}

describe('Valeriy WR ↔ Pando finals', () => {
  test('aligned finals', () => {
    const wr = buildWrSolo(FIXTURE)
    const pando = buildPando(FIXTURE)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(expect.arrayContaining(LISTINGS))
  })

  test('c6 electro crit is a team buff (solo WR omits teamBuff)', () => {
    const off = buildPando(FIXTURE)
    const on = buildPando(
      withConds({ c6Hit: 'on' }, [{ name: 'c6Hit', value: 1 }])
    )
    const delta =
      (on.compute(own.final.critRate_.electro).val as number) -
      (off.compute(own.final.critRate_.electro).val as number)
    expect(delta).toBeGreaterThan(0)
    assertPandoListingsFinite(on)
  })
})
