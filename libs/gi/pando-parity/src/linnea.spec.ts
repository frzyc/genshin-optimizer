/**
 * Linnea WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * Bool `a1Lumi` / `c1TeamStacks` / `c2Moondrift` / `c4Moondrift` `'on'`.
 * Num `c1LumiStacks` 1..(lumiMax*2); stacks > 5 need C6. C3 skill / C5 burst.
 *
 * A4 teammate EM is dest moonsign + destIsActive teamBuff (solo UIData hides
 * it; Linnea is moonsign so ownBuff self EM is 0). Skip `eleMas` always.
 * C2 dest hydro/geo critDMG_ is teamBuff (Linnea is geo). On: skip `critDMG_`.
 * C4 self_def_ is ownBuff always-on; team_def_ is destIsActive. On: skip `def`.
 * A1 geo shred is enemy preRes (keep sign). A0 / C6 gleam specialDmg_ are
 * dmg_.lunarcrystallize (gleam needs moonsign 2; solo tally is 1).
 * Lunar hits are WR lunarDmgNode → Pando customDmg (no lunar transDef).
 *
 *   nx test gi-pando-parity -- linnea.spec.ts
 */
import { expect } from 'vitest'
import {
  assertFinals,
  assertPandoListingsFinite,
  buildPando,
  buildWrSolo,
  DEFAULT_FINALS,
  type FinalStat,
  type ParityFixture,
  pandoListingNames,
} from './harness'

const FIXTURE: ParityFixture = {
  members: [
    {
      char: {
        key: 'Linnea',
        level: 80,
        talent: { auto: 8, skill: 8, burst: 8 },
        ascension: 6,
        constellation: 6,
      },
      weapon: {
        key: 'FavoniusWarbow',
        level: 90,
        ascension: 6,
        refinement: 1,
        location: 'Linnea',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a0_lunarcrystallize_baseDmg_',
  'a4_eleMas',
  'burst_continuousHeal',
  'burst_initialHeal',
  'c1LumiStacks_lunarcrystallize_dmgInc',
  'c1TeamStacks_lunarcrystallize_dmgInc',
  'charged_aimed',
  'charged_aimedCharged',
  'normal_0',
  'normal_1',
  'normal_2',
  'passive_fullyAimed',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill_crushDmg',
  'skill_hammerDmg',
  'skill_pummelerDmg',
]

type LinneaConds = {
  a1Lumi?: boolean
  c1TeamStacks?: boolean
  c1LumiStacks?: number
  c2Moondrift?: boolean
  c4Moondrift?: boolean
}

function withConds(conds: LinneaConds): ParityFixture {
  const wrLinnea: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (conds.a1Lumi) {
    wrLinnea.a1Lumi = 'on'
    pandoConditionals.push({
      sheet: 'Linnea',
      src: '0',
      dst: null,
      name: 'a1Lumi',
      value: 1,
    })
  }
  if (conds.c1TeamStacks) {
    wrLinnea.c1TeamStacks = 'on'
    pandoConditionals.push({
      sheet: 'Linnea',
      src: '0',
      dst: null,
      name: 'c1TeamStacks',
      value: 1,
    })
  }
  if (conds.c1LumiStacks) {
    wrLinnea.c1LumiStacks = String(conds.c1LumiStacks)
    pandoConditionals.push({
      sheet: 'Linnea',
      src: '0',
      dst: null,
      name: 'c1LumiStacks',
      value: conds.c1LumiStacks,
    })
  }
  if (conds.c2Moondrift) {
    wrLinnea.c2Moondrift = 'on'
    pandoConditionals.push({
      sheet: 'Linnea',
      src: '0',
      dst: null,
      name: 'c2Moondrift',
      value: 1,
    })
  }
  if (conds.c4Moondrift) {
    wrLinnea.c4Moondrift = 'on'
    pandoConditionals.push({
      sheet: 'Linnea',
      src: '0',
      dst: null,
      name: 'c4Moondrift',
      value: 1,
    })
  }
  return {
    ...FIXTURE,
    wrConditionals: { Linnea: wrLinnea },
    pandoConditionals,
  }
}

function finalsFor(conds: LinneaConds): readonly FinalStat[] {
  let stats: readonly FinalStat[] = DEFAULT_FINALS.filter((s) => s !== 'eleMas')
  if (conds.c2Moondrift) stats = stats.filter((s) => s !== 'critDMG_')
  if (conds.c4Moondrift) stats = stats.filter((s) => s !== 'def')
  return stats
}

describe('Linnea WR ↔ Pando finals', () => {
  test.each([
    [{}],
    [{ a1Lumi: true }],
    [{ c1TeamStacks: true }],
    [{ c1LumiStacks: 10 }],
    [{ c2Moondrift: true }],
    [{ c4Moondrift: true }],
    [
      {
        a1Lumi: true,
        c1TeamStacks: true,
        c1LumiStacks: 10,
        c2Moondrift: true,
        c4Moondrift: true,
      },
    ],
  ] as const)('aligned finals %j', (conds) => {
    const fixture = Object.keys(conds).length ? withConds(conds) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    assertFinals(wr, pando, finalsFor(conds))
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )
  })
})
