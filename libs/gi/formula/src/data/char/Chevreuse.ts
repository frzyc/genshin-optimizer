import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpEq, cmpGE, min, prod, sum } from '@genshin-optimizer/pando/engine'
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

const key: CharacterKey = 'Chevreuse'
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
      skillParam_gen.auto[a++], // 3.1
      skillParam_gen.auto[a++], // 3.2
      skillParam_gen.auto[a++], // 4
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    pressDmg: skillParam_gen.skill[s++],
    holdDmg: skillParam_gen.skill[s++],
    ballDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    healBase: skillParam_gen.skill[s++],
    healFlat: skillParam_gen.skill[s++],
    bladeDmg: skillParam_gen.skill[s++],
    bladeInterval: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    grenadeDmg: skillParam_gen.burst[b++],
    shellDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    pyroElectro_enemyRes_: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
  },
  passive2: {
    atk_: skillParam_gen.passive2[0][0],
    duration: skillParam_gen.passive2[1][0],
    max_atk_: skillParam_gen.passive2[2][0],
  },
  constellation1: {
    energyRegen: skillParam_gen.constellation1[0],
    cd: skillParam_gen.constellation1[1],
  },
  constellation2: {
    dmg: skillParam_gen.constellation2[0],
    cd: skillParam_gen.constellation2[1],
  },
  constellation6: {
    triggerLength: skillParam_gen.constellation6[0],
    heal: skillParam_gen.constellation6[1],
    pyroElectro_dmg_: skillParam_gen.constellation6[2],
    duration: skillParam_gen.constellation6[3],
    maxStacks: skillParam_gen.constellation6[4],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, ascension, constellation },
} = own
const { a1AfterOverload, a4AfterBall } = allBoolConditionals(info.key)
const { c6AfterHealStacks } = allNumConditionals(
  info.key,
  true,
  0,
  dm.constellation6.maxStacks
)

const onlyPyroElectroTeam = cmpGE(
  team.common.count.electro,
  1,
  cmpEq(own.common.eleCount, 2, 1)
)
const a1AfterOverload_enemyRes_ = a1AfterOverload.ifOn(
  cmpGE(
    ascension,
    1,
    cmpEq(onlyPyroElectroTeam, 1, percent(-dm.passive1.pyroElectro_enemyRes_))
  )
)
const a4AfterBall_atk_opt = a4AfterBall.ifOn(
  cmpGE(
    ascension,
    4,
    min(
      prod(percent(dm.passive2.atk_), own.premod.hp.sheet('agg'), 1 / 1000),
      percent(dm.passive2.max_atk_)
    )
  )
)
const destPyroOrElectro = sum(
  cmpEq(target.char.ele, 'pyro', 1),
  cmpEq(target.char.ele, 'electro', 1)
)
const a4AfterBall_atk_ = prod(
  cmpGE(destPyroOrElectro, 1, 1),
  a4AfterBall_atk_opt
)
const c6AfterHeal_pyroElectro_dmg_ = cmpGE(
  constellation,
  6,
  prod(c6AfterHealStacks, percent(dm.constellation6.pyroElectro_dmg_))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Trick-Shot, Explosive Plot (skill); C5 Enhanced Explosion (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  // WR teamBuff.premod.<ele>_enemyRes_; Pando enemy preRes. Keep WR sign.
  enemyDebuff.common.preRes.pyro.add(a1AfterOverload_enemyRes_),
  enemyDebuff.common.preRes.electro.add(a1AfterOverload_enemyRes_),
  teamBuff.premod.atk_.add(a4AfterBall_atk_),
  teamBuff.premod.dmg_.pyro.add(c6AfterHeal_pyroElectro_dmg_),
  teamBuff.premod.dmg_.electro.add(c6AfterHeal_pyroElectro_dmg_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_press', info, 'atk', dm.skill.pressDmg, 'skill'),
  dmg('skill_hold', info, 'atk', dm.skill.holdDmg, 'skill'),
  dmg('skill_ball', info, 'atk', dm.skill.ballDmg, 'skill'),
  customHeal(
    'skill_heal',
    sum(
      prod(percent(talentSubscript(skill, dm.skill.healBase)), final.hp),
      talentSubscript(skill, dm.skill.healFlat)
    )
  ),
  dmg('skill_blade', info, 'atk', dm.skill.bladeDmg, 'skill'),
  dmg('burst_grenade', info, 'atk', dm.burst.grenadeDmg, 'burst'),
  dmg('burst_shell', info, 'atk', dm.burst.shellDmg, 'burst'),
  customDmg(
    'c2',
    'pyro',
    'skill',
    prod(percent(dm.constellation2.dmg), final.atk),
    { cond: cmpGE(constellation, 2, 'infer', '') }
  ),
  customHeal('c6_heal', prod(percent(dm.constellation6.heal), final.hp), {
    cond: cmpGE(constellation, 6, 'infer', ''),
  }),

  customParam('charged_stam', dm.charged.stam),
  customParam('skill_duration', dm.skill.duration),
  customParam('skill_bladeInterval', dm.skill.bladeInterval),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
