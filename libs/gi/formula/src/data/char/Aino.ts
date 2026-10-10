import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpNE, prod, sum } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  customDmg,
  customParam,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
  team,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'Aino'
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
      skillParam_gen.auto[a++], // 3x2
    ],
  },
  charged: {
    cyclicDmg: skillParam_gen.auto[a++],
    finalDmg: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
    duration: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg1: skillParam_gen.skill[s++],
    dmg2: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    ballDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive2: {
    burst_dmg_: skillParam_gen.passive2[0][0],
  },
  constellation1: {
    eleMas: skillParam_gen.constellation1[0],
    duration: skillParam_gen.constellation1[1],
  },
  constellation2: {
    atkDmg: skillParam_gen.constellation2[0],
    eleMasDmg: skillParam_gen.constellation2[1],
    cd: skillParam_gen.constellation2[2],
  },
  constellation4: {
    energyRegen: skillParam_gen.constellation4[0],
    cd: skillParam_gen.constellation4[1],
  },
  constellation6: {
    ec_bloom_lc_lb_dmg_: skillParam_gen.constellation6[0],
    gleam_ec_bloom_lc_lb_dmg_: skillParam_gen.constellation6[1],
    duration: skillParam_gen.constellation6[2],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
// WR cond(key, 'c1AfterSkillOrBurst' | 'c6AfterBurst')
const { c1AfterSkillOrBurst, c6AfterBurst } = allBoolConditionals(info.key)

const a4_burst_dmgInc = cmpGE(
  ascension,
  4,
  prod(percent(dm.passive2.burst_dmg_), final.eleMas)
)
// WR C1 self premod.eleMas; team active-only via unequal(active, self) → notOwnBuff.
const c1AfterSkillOrBurst_eleMas = c1AfterSkillOrBurst.ifOn(
  cmpGE(constellation, 1, dm.constellation1.eleMas)
)
// WR C6 teamBuff reaction dmg_ dest-gated to active (includes self). Gleam: tally.moonsign >= 2.
const c6AfterBurst_reaction_dmg_ = prod(
  c6AfterBurst.ifOn(
    cmpGE(
      constellation,
      6,
      sum(
        percent(dm.constellation6.ec_bloom_lc_lb_dmg_),
        cmpGE(
          team.common.moonsign,
          2,
          percent(dm.constellation6.gleam_ec_bloom_lc_lb_dmg_)
        )
      )
    )
  ),
  destIsActive
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Cake and the Art of Mechanism Repair (burst); C5 Perpetual Turbine of Metal and Light (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.formula.base.burst.add(a4_burst_dmgInc),
  ownBuff.premod.eleMas.add(c1AfterSkillOrBurst_eleMas),
  notOwnBuff.premod.eleMas.add(
    cmpNE(destIsActive, 0, c1AfterSkillOrBurst_eleMas)
  ),
  teamBuff.premod.dmg_.electrocharged.add(c6AfterBurst_reaction_dmg_),
  teamBuff.premod.dmg_.bloom.add(c6AfterBurst_reaction_dmg_),
  teamBuff.premod.dmg_.lunarcharged.add(c6AfterBurst_reaction_dmg_),
  teamBuff.premod.dmg_.lunarbloom.add(c6AfterBurst_reaction_dmg_),
  teamBuff.premod.dmg_.lunarcrystallize.add(c6AfterBurst_reaction_dmg_),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_cyclic', info, 'atk', dm.charged.cyclicDmg, 'charged'),
  dmg('charged_final', info, 'atk', dm.charged.finalDmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_dmg1', info, 'atk', dm.skill.dmg1, 'skill'),
  dmg('skill_dmg2', info, 'atk', dm.skill.dmg2, 'skill'),
  dmg('burst', info, 'atk', dm.burst.ballDmg, 'burst'),
  customParam('a4_burst_dmgInc', a4_burst_dmgInc, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customDmg(
    'c2',
    info.ele,
    'burst',
    sum(
      prod(percent(dm.constellation2.atkDmg), final.atk),
      prod(percent(dm.constellation2.eleMasDmg), final.eleMas)
    ),
    { cond: cmpGE(constellation, 2, 'infer', '') }
  ),

  customParam('charged_stam', dm.charged.stam),
  customParam('charged_duration', dm.charged.duration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
