/**
 * Jean WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 * C2 atkSPD_/moveSPD_ are WR teamBuff; solo computeUIData does not apply them.
 * C4 is enemy anemo RES (may not move DEFAULT_FINALS). C6 dmgRed_ is
 * customParam only (no Pando tag; WR activeCharBuff / destIsActive).
 *
 *   nx test gi-pando-parity -- jean.spec.ts
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
        key: 'Jean',
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
        location: 'Jean',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a1_heal',
  'a4_energyRegen',
  'burst',
  'burst_contRegen',
  'burst_enterExit',
  'burst_regen',
  'c6_dmgRed_',
  'charged',
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

type JeanConds = {
  c1?: boolean
  c2?: boolean
  c4?: boolean
  c6?: boolean
}

function withConds(conds: JeanConds): ParityFixture {
  const wrJean: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  for (const name of ['c1', 'c2', 'c4', 'c6'] as const) {
    if (!conds[name]) continue
    wrJean[name] = 'on'
    pandoConditionals.push({
      sheet: 'Jean',
      src: '0',
      dst: null,
      name,
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Jean: wrJean },
    pandoConditionals,
  }
}

describe('Jean WR ↔ Pando finals', () => {
  test.each([
    [{}],
    [{ c1: true }],
    [{ c2: true }],
    [{ c4: true }],
    [{ c6: true }],
    [{ c1: true, c2: true, c4: true, c6: true }],
  ] as const)('aligned finals %j', (conds) => {
    const fixture = Object.keys(conds).length ? withConds(conds) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando)
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )

    const pandoAtkSPD_ = pando.compute(own.premod.atkSPD_).val as number
    expect(pandoAtkSPD_).toBeCloseTo(conds.c2 ? 0.15 : 0)
  })
})
