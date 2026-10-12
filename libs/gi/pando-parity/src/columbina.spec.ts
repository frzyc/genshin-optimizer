/**
 * Columbina WR ↔ Pando finals after gi-sheet-port.
 * WR DMG listings remain blocked (getDisplay); gate is finals + Pando smoke.
 *
 * C3 skill / C5 burst. Catalyst NA/CA/plunge are already Hydro.
 * A0 / burstDomain / C1–C6 lunar_* are teamBuff dmg_ (not in DEFAULT_FINALS).
 * C2 brilliance hp_ is ownBuff. C2 gleam atk/eleMas/def are destIsActive
 * teamBuff (moonsign >= 2); solo moonsign=1 so they stay 0. Skip those finals
 * when the conds are on anyway (WR teamBuff hidden in solo UIData).
 * C6 elemental critDMG_ is teamBuff (not generic critDMG_).
 * Lunar C2/C6 conds are lists (`'lunarcharged'` / `'lunarbloom'` /
 * `'lunarcrystallize'`), not bool `'on'`. Pando list value is 1-based.
 * Lunar hits are WR lunarDmgNode → Pando dmg() (no lunar ×3 / transDef).
 *
 *   nx test gi-pando-parity -- columbina.spec.ts
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
        key: 'Columbina',
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
        location: 'Columbina',
        lock: false,
      },
    },
  ],
  enemy: { lvl: 90, preRes: 0.1 },
  hitMode: 'avgHit',
}

const EXPECTED_LISTINGS = [
  'a0_lunar_baseDmg_',
  'burst',
  'c1_shield',
  'c1_shieldHydro',
  'c4Buff_lunarcharged_dmgInc',
  'c4Buff_lunarbloom_dmgInc',
  'c4Buff_lunarcrystallize_dmgInc',
  'charged',
  'charged_dewDmg',
  'normal_0',
  'normal_1',
  'normal_2',
  'plunging_dmg',
  'plunging_high',
  'plunging_low',
  'skill',
  'skill_continuousDmg',
  'skill_lunarchargedDmg',
  'skill_lunarbloomDmg',
  'skill_lunarcrystallizeDmg',
]

type ColumbinaConds = {
  burstDomain?: boolean
  a1Stacks?: number
  c2Brilliance?: boolean
  c2Lunarcharged?: boolean
  c2Lunarbloom?: boolean
  c2Lunarcrystallize?: boolean
  c4Buff?: boolean
  c6Lunarcharged?: boolean
  c6Lunarbloom?: boolean
  c6Lunarcrystallize?: boolean
}

function pushBool(
  wr: Record<string, string | number>,
  pando: NonNullable<ParityFixture['pandoConditionals']>,
  name: string,
  on: boolean | undefined,
  wrValue: string
) {
  if (!on) return
  wr[name] = wrValue
  pando.push({
    sheet: 'Columbina',
    src: '0',
    dst: null,
    name,
    value: 1,
  })
}

function withConds(conds: ColumbinaConds): ParityFixture {
  const wrColumbina: Record<string, string | number> = {}
  const pandoConditionals: NonNullable<ParityFixture['pandoConditionals']> = []
  if (conds.a1Stacks && conds.a1Stacks > 0) {
    wrColumbina.a1Stacks = String(conds.a1Stacks)
    pandoConditionals.push({
      sheet: 'Columbina',
      src: '0',
      dst: null,
      name: 'a1Stacks',
      value: conds.a1Stacks,
    })
  }
  pushBool(
    wrColumbina,
    pandoConditionals,
    'burstDomain',
    conds.burstDomain,
    'on'
  )
  pushBool(
    wrColumbina,
    pandoConditionals,
    'c2Brilliance',
    conds.c2Brilliance,
    'on'
  )
  pushBool(
    wrColumbina,
    pandoConditionals,
    'c2Lunarcharged',
    conds.c2Lunarcharged,
    'lunarcharged'
  )
  pushBool(
    wrColumbina,
    pandoConditionals,
    'c2Lunarbloom',
    conds.c2Lunarbloom,
    'lunarbloom'
  )
  pushBool(
    wrColumbina,
    pandoConditionals,
    'c2Lunarcrystallize',
    conds.c2Lunarcrystallize,
    'lunarcrystallize'
  )
  pushBool(wrColumbina, pandoConditionals, 'c4Buff', conds.c4Buff, 'on')
  pushBool(
    wrColumbina,
    pandoConditionals,
    'c6Lunarcharged',
    conds.c6Lunarcharged,
    'lunarcharged'
  )
  pushBool(
    wrColumbina,
    pandoConditionals,
    'c6Lunarbloom',
    conds.c6Lunarbloom,
    'lunarbloom'
  )
  pushBool(
    wrColumbina,
    pandoConditionals,
    'c6Lunarcrystallize',
    conds.c6Lunarcrystallize,
    'lunarcrystallize'
  )
  return {
    ...FIXTURE,
    wrConditionals: { Columbina: wrColumbina },
    pandoConditionals,
  }
}

function finalsFor(conds: ColumbinaConds): readonly FinalStat[] {
  let stats: FinalStat[] = [...DEFAULT_FINALS]
  if (conds.c2Lunarcharged) stats = stats.filter((s) => s !== 'atk')
  if (conds.c2Lunarbloom) stats = stats.filter((s) => s !== 'eleMas')
  if (conds.c2Lunarcrystallize) stats = stats.filter((s) => s !== 'def')
  return stats
}

describe('Columbina WR ↔ Pando finals', () => {
  test.each([
    {},
    { a1Stacks: 3 },
    { burstDomain: true },
    { c2Brilliance: true },
    { c2Brilliance: true, c2Lunarcharged: true },
    { c2Brilliance: true, c2Lunarbloom: true },
    { c4Buff: true },
    { c6Lunarcharged: true },
    { c6Lunarbloom: true },
    {
      burstDomain: true,
      a1Stacks: 3,
      c2Brilliance: true,
      c2Lunarcharged: true,
      c2Lunarbloom: true,
      c2Lunarcrystallize: true,
      c4Buff: true,
      c6Lunarcharged: true,
      c6Lunarbloom: true,
      c6Lunarcrystallize: true,
    },
  ] as const)('aligned finals (%j)', (conds) => {
    const fixture = Object.keys(conds).length ? withConds(conds) : FIXTURE
    const wr = buildWrSolo(fixture)
    const pando = buildPando(fixture)
    // WR teamBuff atk/eleMas/def is hidden in solo UIData; Pando destIsActive
    // would apply them at moonsign >= 2. Solo moonsign=1, gleam off.
    assertFinals(wr, pando, finalsFor(conds))
    assertPandoListingsFinite(pando)
    expect(pandoListingNames(pando)).toEqual(
      expect.arrayContaining(EXPECTED_LISTINGS)
    )
  })
})
