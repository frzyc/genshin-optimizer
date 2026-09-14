/**
 * Navia WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bools `a1AfterSkill` / `c4AfterBurstHit` are `'on'`. Num `skillCharges` 0–6
 * and `shotsHit` 0–11 ↔ WR `'1'`…`'6'` / `'1'`…`'11'`. C3 skill / C5 burst.
 * C4 geo shred is WR teamBuff → enemyDebuff.preRes.geo (not DEFAULT_FINALS).
 * Solo computeUIData does not apply WR teamBuff; Pando does.
 *
 *   nx test gi-pando-parity -- navia.spec.ts
 */
import { enemy, own } from '@genshin-optimizer/gi/formula'
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
        key: 'Navia',
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
        location: 'Navia',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'bladeDmg',
  'burst',
  'charged_cyclic',
  'charged_final',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'supportDmg',
  'totalShardDmg',
]

type NaviaConds = {
  skillCharges?: number
  shotsHit?: number
  a1AfterSkill?: boolean
  c4AfterBurstHit?: boolean
}

function withConds(conds: NaviaConds): ParityFixture {
  const wrNavia: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (conds.skillCharges) {
    wrNavia.skillCharges = String(conds.skillCharges)
    pandoConditionals.push({
      sheet: 'Navia',
      src: '0',
      dst: null,
      name: 'skillCharges',
      value: conds.skillCharges,
    })
  }
  if (conds.shotsHit) {
    wrNavia.shotsHit = String(conds.shotsHit)
    pandoConditionals.push({
      sheet: 'Navia',
      src: '0',
      dst: null,
      name: 'shotsHit',
      value: conds.shotsHit,
    })
  }
  if (conds.a1AfterSkill) {
    wrNavia.a1AfterSkill = 'on'
    pandoConditionals.push({
      sheet: 'Navia',
      src: '0',
      dst: null,
      name: 'a1AfterSkill',
      value: 1,
    })
  }
  if (conds.c4AfterBurstHit) {
    wrNavia.c4AfterBurstHit = 'on'
    pandoConditionals.push({
      sheet: 'Navia',
      src: '0',
      dst: null,
      name: 'c4AfterBurstHit',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Navia: wrNavia },
    pandoConditionals,
  }
}

describe('Navia WR ↔ Pando finals', () => {
  test.each([
    [{}],
    [{ a1AfterSkill: true }],
    [{ skillCharges: 6 }],
    [{ skillCharges: 6, shotsHit: 11 }],
    [{ c4AfterBurstHit: true }],
    [
      {
        a1AfterSkill: true,
        skillCharges: 6,
        shotsHit: 11,
        c4AfterBurstHit: true,
      },
    ],
  ] as const)('aligned finals %j', (conds) => {
    const fixture = Object.keys(conds).length ? withConds(conds) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    const off = buildPando(FIXTURE)
    expect(pando.compute(own.premod.dmg_.normal).val as number).toBeCloseTo(
      (off.compute(own.premod.dmg_.normal).val as number) +
        (conds.a1AfterSkill ? 0.4 : 0)
    )
    expect(pando.compute(own.premod.dmg_.skill).val as number).toBeCloseTo(
      (off.compute(own.premod.dmg_.skill).val as number) +
        (conds.skillCharges === 6 ? 0.45 : 0)
    )
    expect(pando.compute(enemy.common.preRes.geo).val as number).toBeCloseTo(
      0.1 - (conds.c4AfterBurstHit ? 0.2 : 0)
    )
  })
})
