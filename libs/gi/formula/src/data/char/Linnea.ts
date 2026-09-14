import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpEq, cmpGE, min, prod, sum } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  allNumConditionals,
  customDmg,
  customHeal,
  customParam,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  target,
  team,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Linnea'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
    ],
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    fullyAimed: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    pummelerDmg: skillParam_gen.skill[s++], // x2
    hammerDmg: skillParam_gen.skill[s++],
    crushDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    initialHealFlat: skillParam_gen.burst[b++],
    initialHealMult: skillParam_gen.burst[b++],
    continuousHealFlat: skillParam_gen.burst[b++],
    continuousHealMult: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    geo_enemyRes_: skillParam_gen.passive1[0][0],
    gleamGeo_enemyRes_: skillParam_gen.passive1[1][0],
  },
  passive2: {
    eleMas: skillParam_gen.passive2[0][0],
  },
  passive3: {
    base_lunarcrystallize_dmg_: skillParam_gen.passive3![0][0],
    maxBase_lunarcrystallize_dmg_: skillParam_gen.passive3![1][0],
  },
  passive: {
    dmg: skillParam_gen.passive![0][0],
  },
  constellation1: {
    stacks: skillParam_gen.constellation1[0],
    maxStacks: skillParam_gen.constellation1[1],
    duration: skillParam_gen.constellation1[2],
    lunarcrystallize_dmgInc: skillParam_gen.constellation1[3],
    lumiMaxStacksConsume: skillParam_gen.constellation1[4],
    lumi_dmgInc: skillParam_gen.constellation1[5],
  },
  constellation2: {
    hydroGeo_critDMG_: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
    lumi_critDMG_: skillParam_gen.constellation2[2],
  },
  constellation4: {
    duration: skillParam_gen.constellation4[0],
    self_def_: skillParam_gen.constellation4[1],
    team_def_: skillParam_gen.constellation4[2],
  },
  constellation6: {
    lunarcrystallize_specialDmg_: skillParam_gen.constellation6[0],
    stacksConsumed: skillParam_gen.constellation6[1],
    lunarcrystallize_dmgInc: skillParam_gen.constellation6[2],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, burst, ascension, constellation },
} = own
// WR cond(key, 'a1Lumi' | 'c1TeamStacks' | 'c2Moondrift' | 'c4Moondrift') `'on'`
const { a1Lumi, c1TeamStacks, c2Moondrift, c4Moondrift } = allBoolConditionals(
  info.key
)
// WR lookup(cond(key, 'c1LumiStacks'), 1..(lumiMax*2)); stacks > lumiMax need C6
const { c1LumiStacks } = allNumConditionals(
  info.key,
  true,
  0,
  dm.constellation1.lumiMaxStacksConsume * 2
)

const defAgg = own.premod.def.sheet('agg')
const destMoonsign = cmpGE(target.common.moonsign, 1, 1)

const a1Lumi_geo_enemyRes_ = a1Lumi.ifOn(
  cmpGE(
    ascension,
    1,
    cmpGE(
      team.common.moonsign,
      2,
      percent(-dm.passive1.gleamGeo_enemyRes_),
      percent(-dm.passive1.geo_enemyRes_)
    )
  )
)

const a4_eleMas = cmpGE(ascension, 4, prod(percent(dm.passive2.eleMas), defAgg))
// WR equal(active.flags.isMoonsign) + equal(activeCharKey, target): dest moonsign + destIsActive
const a4Active_teammate_eleMas = prod(a4_eleMas, destMoonsign, destIsActive)
// WR unequal(active.flags.isMoonsign): dest is not moonsign
const a4Active_self_eleMas = prod(
  a4_eleMas,
  cmpGE(target.common.moonsign, 1, 0, 1)
)

const a0_lunarcrystallize_baseDmg_ = min(
  prod(percent(dm.passive3.base_lunarcrystallize_dmg_), final.def, 1 / 100),
  percent(dm.passive3.maxBase_lunarcrystallize_dmg_)
)

const c1LumiStacksVal = prod(
  c1LumiStacks,
  cmpGE(
    c1LumiStacks,
    dm.constellation1.lumiMaxStacksConsume + 1,
    cmpGE(constellation, 6, 1),
    1
  )
)
const c1TeamStacks_lunarcrystallize_dmgInc = c1TeamStacks.ifOn(
  cmpGE(
    constellation,
    1,
    prod(
      cmpGE(
        constellation,
        6,
        percent(
          dm.constellation6.stacksConsumed *
            dm.constellation6.lunarcrystallize_dmgInc *
            dm.constellation1.lunarcrystallize_dmgInc
        ),
        percent(dm.constellation1.lunarcrystallize_dmgInc)
      ),
      defAgg
    )
  )
)
const c1LumiStacks_lunarcrystallize_dmgInc = cmpGE(
  constellation,
  1,
  prod(
    c1LumiStacksVal,
    cmpGE(
      constellation,
      6,
      percent(
        dm.constellation6.lunarcrystallize_dmgInc *
          dm.constellation1.lumi_dmgInc
      ),
      percent(dm.constellation1.lumi_dmgInc)
    ),
    defAgg
  )
)
// WR crush overlay: lumi and team do not stack
const crushC1_dmgInc = sum(
  c1LumiStacks_lunarcrystallize_dmgInc,
  prod(-1, c1TeamStacks_lunarcrystallize_dmgInc)
)

const c2Moondrift_hydroGeo_critDMG_ = prod(
  c2Moondrift.ifOn(
    cmpGE(constellation, 2, percent(dm.constellation2.hydroGeo_critDMG_))
  ),
  cmpGE(
    sum(cmpEq(target.char.ele, 'hydro', 1), cmpEq(target.char.ele, 'geo', 1)),
    1,
    1
  )
)
const c2Lumi_critDMG_ = c2Moondrift.ifOn(
  cmpGE(constellation, 2, percent(dm.constellation2.lumi_critDMG_))
)

const c4Moondrift_active_def_ = prod(
  c4Moondrift.ifOn(
    cmpGE(constellation, 4, percent(dm.constellation4.team_def_))
  ),
  destIsActive
)
const c4Moondrift_self_def_ = cmpGE(
  constellation,
  4,
  percent(dm.constellation4.self_def_)
)

const c6Gleam_lunarcrystallize_specialDmg_ = cmpGE(
  constellation,
  6,
  cmpGE(
    team.common.moonsign,
    2,
    percent(dm.constellation6.lunarcrystallize_specialDmg_)
  )
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Eventful Log Page (skill); C5 Fairyland's Farewell Gift (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.eleMas.add(a4Active_self_eleMas),
  ownBuff.premod.def_.add(c4Moondrift_self_def_),
  // C6 Gleam — WR lunarcrystallize_specialDmg_ (no Pando specialDmg_ tag)
  ownBuff.premod.dmg_.lunarcrystallize.add(
    c6Gleam_lunarcrystallize_specialDmg_
  ),

  // A0 Moonsign Benediction — WR teamBuff lunarcrystallize_baseDmg_ (no Pando baseDmg_ tag)
  teamBuff.premod.dmg_.lunarcrystallize.add(a0_lunarcrystallize_baseDmg_),
  teamBuff.premod.eleMas.add(a4Active_teammate_eleMas),
  teamBuff.premod.critDMG_.add(c2Moondrift_hydroGeo_critDMG_),
  teamBuff.premod.def_.add(c4Moondrift_active_def_),
  // A1 Lumi — WR teamBuff.premod.geo_enemyRes_; keep sign
  enemyDebuff.common.preRes.geo.add(a1Lumi_geo_enemyRes_),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_aimed', info, 'atk', dm.charged.aimed, 'charged', {
    ele: 'physical',
  }),
  dmg('charged_aimedCharged', info, 'atk', dm.charged.fullyAimed, 'charged', {
    ele: info.ele,
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_pummelerDmg', info, 'def', dm.skill.pummelerDmg, 'skill'),
  // WR lunarDmgNode (special reaction / transDef / lunarcrystallize_*). No Pando lunarDmg.
  customDmg(
    'skill_hammerDmg',
    info.ele,
    'skill',
    prod(final.def, percent(talentSubscript(skill, dm.skill.hammerDmg))),
    undefined,
    ownBuff.formula.base.add(c1TeamStacks_lunarcrystallize_dmgInc)
  ),
  customDmg(
    'skill_crushDmg',
    info.ele,
    'skill',
    prod(final.def, percent(talentSubscript(skill, dm.skill.crushDmg))),
    undefined,
    // WR teamBuff lunarcrystallize_dmgInc + crush overlay (lumi − team)
    ownBuff.formula.base.add(c1TeamStacks_lunarcrystallize_dmgInc),
    ownBuff.formula.base.add(crushC1_dmgInc),
    ownBuff.premod.critDMG_.add(c2Lumi_critDMG_)
  ),
  customHeal(
    'burst_initialHeal',
    sum(
      prod(
        percent(talentSubscript(burst, dm.burst.initialHealMult)),
        final.def
      ),
      talentSubscript(burst, dm.burst.initialHealFlat)
    )
  ),
  customHeal(
    'burst_continuousHeal',
    sum(
      prod(
        percent(talentSubscript(burst, dm.burst.continuousHealMult)),
        final.def
      ),
      talentSubscript(burst, dm.burst.continuousHealFlat)
    )
  ),
  dmg('passive_fullyAimed', info, 'atk', dm.charged.fullyAimed, 'charged', {
    ele: info.ele,
    baseMulti: percent(dm.passive.dmg),
  }),

  customParam('a0_lunarcrystallize_baseDmg_', a0_lunarcrystallize_baseDmg_),
  customParam('a4_eleMas', a4_eleMas, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam(
    'c1TeamStacks_lunarcrystallize_dmgInc',
    c1TeamStacks_lunarcrystallize_dmgInc,
    { cond: cmpGE(constellation, 1, 'infer', '') }
  ),
  customParam(
    'c1LumiStacks_lunarcrystallize_dmgInc',
    c1LumiStacks_lunarcrystallize_dmgInc,
    { cond: cmpGE(constellation, 1, 'infer', '') }
  ),
  customParam('skill_duration', dm.skill.duration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
