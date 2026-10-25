import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, min, prod, sum } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  customParam,
  customShield,
  own,
  ownBuff,
  percent,
  register,
  team,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Columbina'
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
    dmg: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
    dewDmg: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    continuousDmg: skillParam_gen.skill[s++],
    lchargedDmg: skillParam_gen.skill[s++],
    lbloomDmg: skillParam_gen.skill[s++],
    lcrystallizeDmg: skillParam_gen.skill[s++],
    gravAccumCd: skillParam_gen.skill[s++][0],
    gravAccum: skillParam_gen.skill[s++][0],
    maxGrav: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    lunar_dmg_: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    critRate_: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
    maxStacks: 3,
  },
  passive3: {
    base_lunar_dmg_: skillParam_gen.passive3![0][0],
    maxBase_lunar_dmg_: skillParam_gen.passive3![1][0],
  },
  constellation1: {
    energyRegen: skillParam_gen.constellation1[0],
    interruptRes: skillParam_gen.constellation1[1],
    resDuration: skillParam_gen.constellation1[2],
    shield: skillParam_gen.constellation1[3],
    shieldDuration: skillParam_gen.constellation1[4],
    triggerCd: skillParam_gen.constellation1[5],
    lunar_special_: skillParam_gen.constellation1[6],
  },
  constellation2: {
    gravityRate: skillParam_gen.constellation2[0],
    hp_: skillParam_gen.constellation2[1],
    duration: skillParam_gen.constellation2[2],
    atk: skillParam_gen.constellation2[3],
    eleMas: skillParam_gen.constellation2[4],
    def: skillParam_gen.constellation2[5],
    lunar_special_: skillParam_gen.constellation2[6],
  },
  constellation3: {
    lunar_special_: skillParam_gen.constellation3[0],
  },
  constellation4: {
    energyRegen: skillParam_gen.constellation4[0],
    lunarcharged_dmg_: skillParam_gen.constellation4[1],
    lunarbloom_dmg_: skillParam_gen.constellation4[2],
    lunarcrystallize_dmg_: skillParam_gen.constellation4[3],
    cd: skillParam_gen.constellation4[4],
    lunar_special_: skillParam_gen.constellation4[5],
  },
  constellation5: {
    lunar_special_: skillParam_gen.constellation5[0],
  },
  constellation6: {
    crit_dmg_: 0.8,
    duration: skillParam_gen.constellation6[0],
    lunar_special_: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  premod,
  char: { burst, ascension, constellation },
} = own
// WR cond(key, 'burstDomain' | 'c2Brilliance' | 'c4Buff') `'on'`
const { burstDomain, c2Brilliance, c4Buff } = allBoolConditionals(info.key)
// WR cond values are not `'on'` — list + `.map`, not bool `.ifOn`.
const { c2Lunarcharged, c6Lunarcharged } = allListConditionals(info.key, [
  'lunarcharged',
])
const { c2Lunarbloom, c6Lunarbloom } = allListConditionals(info.key, [
  'lunarbloom',
])
const { c2Lunarcrystallize, c6Lunarcrystallize } = allListConditionals(
  info.key,
  ['lunarcrystallize']
)
const c2LunarchargedOn = c2Lunarcharged.map({ lunarcharged: 1 })
const c2LunarbloomOn = c2Lunarbloom.map({ lunarbloom: 1 })
const c2LunarcrystallizeOn = c2Lunarcrystallize.map({ lunarcrystallize: 1 })
const c6LunarchargedOn = c6Lunarcharged.map({ lunarcharged: 1 })
const c6LunarbloomOn = c6Lunarbloom.map({ lunarbloom: 1 })
const c6LunarcrystallizeOn = c6Lunarcrystallize.map({ lunarcrystallize: 1 })
// WR lookup(cond(key, 'a1Stacks'), 1..3); default off = 0
const { a1Stacks } = allNumConditionals(
  info.key,
  true,
  0,
  dm.passive1.maxStacks
)

const gleam = cmpGE(team.common.moonsign, 2, 1)

const burstDomain_lunar_dmg_ = burstDomain.ifOn(
  percent(talentSubscript(burst, dm.burst.lunar_dmg_))
)
const a0_lunar_baseDmg_ = min(
  prod(percent(dm.passive3.base_lunar_dmg_), final.hp, 1 / 1000),
  percent(dm.passive3.maxBase_lunar_dmg_)
)
const a1Stacks_critRate_ = cmpGE(
  ascension,
  1,
  prod(a1Stacks, percent(dm.passive1.critRate_))
)
const lunar_specialDmg_ = sum(
  cmpGE(constellation, 1, percent(dm.constellation1.lunar_special_)),
  cmpGE(constellation, 2, percent(dm.constellation2.lunar_special_)),
  cmpGE(constellation, 3, percent(dm.constellation3.lunar_special_)),
  cmpGE(constellation, 4, percent(dm.constellation4.lunar_special_)),
  cmpGE(constellation, 5, percent(dm.constellation5.lunar_special_)),
  cmpGE(constellation, 6, percent(dm.constellation6.lunar_special_))
)
const lunar_dmg_ = sum(
  burstDomain_lunar_dmg_,
  a0_lunar_baseDmg_,
  lunar_specialDmg_
)

const c1Shield = cmpGE(
  constellation,
  1,
  cmpGE(gleam, 1, prod(percent(dm.constellation1.shield), final.hp))
)

const c2Brilliance_hp_ = c2Brilliance.ifOn(
  cmpGE(constellation, 2, percent(dm.constellation2.hp_))
)
// WR teamBuff dest-gated to active; conversion uses premod.hp (excludes C2 hp_).
const c2Lunarcharged_atkDisp = c2Brilliance.ifOn(
  cmpGE(
    constellation,
    2,
    cmpGE(
      gleam,
      1,
      prod(
        c2LunarchargedOn,
        percent(dm.constellation2.atk),
        premod.hp.sheet('agg')
      )
    )
  )
)
const c2Lunarcharged_atk = prod(c2Lunarcharged_atkDisp, destIsActive)
const c2Lunarbloom_eleMasDisp = c2Brilliance.ifOn(
  cmpGE(
    constellation,
    2,
    cmpGE(
      gleam,
      1,
      prod(
        c2LunarbloomOn,
        percent(dm.constellation2.eleMas),
        premod.hp.sheet('agg')
      )
    )
  )
)
const c2Lunarbloom_eleMas = prod(c2Lunarbloom_eleMasDisp, destIsActive)
const c2Lunarcrystallize_defDisp = c2Brilliance.ifOn(
  cmpGE(
    constellation,
    2,
    cmpGE(
      gleam,
      1,
      prod(
        c2LunarcrystallizeOn,
        percent(dm.constellation2.def),
        premod.hp.sheet('agg')
      )
    )
  )
)
const c2Lunarcrystallize_def = prod(c2Lunarcrystallize_defDisp, destIsActive)

const c4Buff_lunarcharged_dmgInc = c4Buff.ifOn(
  cmpGE(
    constellation,
    4,
    prod(percent(dm.constellation4.lunarcharged_dmg_), final.hp)
  )
)
const c4Buff_lunarbloom_dmgInc = c4Buff.ifOn(
  cmpGE(
    constellation,
    4,
    prod(percent(dm.constellation4.lunarbloom_dmg_), final.hp)
  )
)
// WR uses lunarcharged_dmg_ for the crystallize overlay (same 12.5% in dm).
const c4Buff_lunarcrystallize_dmgInc = c4Buff.ifOn(
  cmpGE(
    constellation,
    4,
    prod(percent(dm.constellation4.lunarcharged_dmg_), final.hp)
  )
)

const c6_hydro_critDMG_ = cmpGE(
  constellation,
  6,
  cmpGE(
    sum(c6LunarchargedOn, c6LunarbloomOn, c6LunarcrystallizeOn),
    1,
    percent(dm.constellation6.crit_dmg_)
  )
)
const c6_electro_critDMG_ = cmpGE(
  constellation,
  6,
  prod(c6LunarchargedOn, percent(dm.constellation6.crit_dmg_))
)
const c6_dendro_critDMG_ = cmpGE(
  constellation,
  6,
  prod(c6LunarbloomOn, percent(dm.constellation6.crit_dmg_))
)
const c6_geo_critDMG_ = cmpGE(
  constellation,
  6,
  prod(c6LunarcrystallizeOn, percent(dm.constellation6.crit_dmg_))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Eternal Tides (skill); C5 Moonlit Melancholy (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.critRate_.add(a1Stacks_critRate_),
  ownBuff.premod.hp_.add(c2Brilliance_hp_),
  // A0 / burst domain / C1–C6 — WR lunar_baseDmg_ / lunar_dmg_ / lunar_specialDmg_
  // (no Pando baseDmg_ / specialDmg_ tags)
  teamBuff.premod.dmg_.lunarcharged.add(lunar_dmg_),
  teamBuff.premod.dmg_.lunarbloom.add(lunar_dmg_),
  teamBuff.premod.dmg_.lunarcrystallize.add(lunar_dmg_),
  teamBuff.premod.atk.add(c2Lunarcharged_atk),
  teamBuff.premod.eleMas.add(c2Lunarbloom_eleMas),
  teamBuff.premod.def.add(c2Lunarcrystallize_def),
  teamBuff.premod.critDMG_.hydro.add(c6_hydro_critDMG_),
  teamBuff.premod.critDMG_.electro.add(c6_electro_critDMG_),
  teamBuff.premod.critDMG_.dendro.add(c6_dendro_critDMG_),
  teamBuff.premod.critDMG_.geo.add(c6_geo_critDMG_),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  // WR lunarDmgNode (special reaction / transDef / lunarbloom_*). No Pando lunarDmg.
  dmg('charged_dewDmg', info, 'hp', dm.charged.dewDmg, 'charged', {
    ele: 'dendro',
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'hp', dm.skill.skillDmg, 'skill'),
  dmg('skill_continuousDmg', info, 'hp', dm.skill.continuousDmg, 'skill'),
  dmg(
    'skill_lunarchargedDmg',
    info,
    'hp',
    dm.skill.lchargedDmg,
    'skill',
    undefined,
    ownBuff.formula.base.add(c4Buff_lunarcharged_dmgInc)
  ),
  dmg(
    'skill_lunarbloomDmg',
    info,
    'hp',
    dm.skill.lbloomDmg,
    'skill',
    undefined,
    ownBuff.formula.base.add(c4Buff_lunarbloom_dmgInc)
  ),
  dmg(
    'skill_lunarcrystallizeDmg',
    info,
    'hp',
    dm.skill.lcrystallizeDmg,
    'skill',
    undefined,
    ownBuff.formula.base.add(c4Buff_lunarcrystallize_dmgInc)
  ),
  dmg('burst', info, 'hp', dm.burst.skillDmg, 'burst'),
  customShield('c1_shield', undefined, c1Shield, {
    cond: cmpGE(constellation, 1, 'infer', ''),
  }),
  customShield('c1_shieldHydro', 'hydro', c1Shield, {
    cond: cmpGE(constellation, 1, 'infer', ''),
  }),

  customParam('a0_lunar_baseDmg_', a0_lunar_baseDmg_),
  customParam('c4Buff_lunarcharged_dmgInc', c4Buff_lunarcharged_dmgInc, {
    cond: cmpGE(constellation, 4, 'infer', ''),
  }),
  customParam('c4Buff_lunarbloom_dmgInc', c4Buff_lunarbloom_dmgInc, {
    cond: cmpGE(constellation, 4, 'infer', ''),
  }),
  customParam(
    'c4Buff_lunarcrystallize_dmgInc',
    c4Buff_lunarcrystallize_dmgInc,
    { cond: cmpGE(constellation, 4, 'infer', '') }
  ),
  customParam('charged_stam', dm.charged.stam),
  customParam('skill_cd', dm.skill.cd),
  customParam('skill_duration', dm.skill.duration),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
