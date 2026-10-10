/**
 * Xilonen WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * sourceActive / nsBlessing / C2 / c4Blooming are WR teamBuff (RES, ele-gated
 * C2, C4 dmgInc). Solo computeUIData does not apply them. Skip none of
 * DEFAULT_FINALS for geo solo (C2 pyro atk_ / hydro hp_ / cryo critDMG_ do not
 * land on geo dest; all_dmg_ / dmgInc / enemy RES are not in DEFAULT_FINALS).
 * nsBurst A4 def_ is ownBuff and is compared.
 *
 * C3 is skill +3, C5 is burst +3. C6 fixture: C2 keeps geo RES shred on when
 * convertedSources < 3 (solo).
 *
 *   nx test gi-pando-parity -- xilonen.spec.ts
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
        key: 'Xilonen',
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
        location: 'Xilonen',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'burst',
  'burst_beat',
  'burst_heal',
  'c6_heal',
  'c6Imperishable_normal_dmgInc',
  'c6Imperishable_plunging_dmgInc',
  'charged',
  'normal_0',
  'normal_1',
  'normal_2',
  'normal_ns0',
  'normal_ns1',
  'normal_ns2',
  'normal_ns3',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'plunging_ns_dmg',
  'plunging_ns_high',
  'plunging_ns_low',
  'skill',
]

type XilonenConds = {
  sourceActive?: boolean
  nsBlessing?: boolean
  nsBurst?: boolean
  c4Blooming?: boolean
  c6Imperishable?: boolean
}

function withConds(conds: XilonenConds): ParityFixture {
  const wrXilonen: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  for (const name of [
    'sourceActive',
    'nsBlessing',
    'nsBurst',
    'c4Blooming',
    'c6Imperishable',
  ] as const) {
    if (!conds[name]) continue
    wrXilonen[name] = 'on'
    pandoConditionals.push({
      sheet: 'Xilonen',
      src: '0',
      dst: null,
      name,
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Xilonen: wrXilonen },
    pandoConditionals,
  }
}

describe('Xilonen WR ↔ Pando finals', () => {
  test.each([
    [{}],
    [{ nsBurst: true }],
    [{ nsBlessing: true }],
    [
      {
        sourceActive: true,
        nsBlessing: true,
        nsBurst: true,
        c4Blooming: true,
        c6Imperishable: true,
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
    expect(pando.compute(own.final.def_).val as number).toBeCloseTo(
      (off.compute(own.final.def_).val as number) + (conds.nsBurst ? 0.2 : 0)
    )
    expect(pando.compute(own.premod.dmg_.normal).val as number).toBeCloseTo(
      (off.compute(own.premod.dmg_.normal).val as number) +
        (conds.nsBlessing ? 0.3 : 0)
    )
    // C3 skill +3 on talent 8 → lvl 11 → dm.skill.enemyRes_[10] = -0.39. C2 keeps geo on.
    expect(pando.compute(enemy.common.preRes.geo).val as number).toBeCloseTo(
      0.1 - 0.39
    )

    if (conds.c6Imperishable) {
      expect(
        pando.compute(own.formula.base.normal).val as number
      ).toBeGreaterThan(off.compute(own.formula.base.normal).val as number)
    }
  })
})
