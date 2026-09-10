import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allNumConditionals,
  customParam,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'Diluc'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0,
  p1 = 0,
  p2 = 0,
  c2i = 0,
  c6i = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4
    ],
  },
  charged: {
    spinningDmg: skillParam_gen.auto[a++],
    finalDmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
    duration: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    firstHit: skillParam_gen.skill[s++],
    secondHit: skillParam_gen.skill[s++],
    thridHit: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    slashDmg: skillParam_gen.burst[b++],
    dotDmg: skillParam_gen.burst[b++],
    explosionDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    stamReduction: skillParam_gen.passive1[p1++][0],
    duration: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    durationInc: skillParam_gen.passive2[p2++][0],
    pyroInc: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    dmgInc: skillParam_gen.constellation1[0],
    hpThresh_: 0.5,
  },
  constellation2: {
    atkInc: skillParam_gen.constellation2[c2i++],
    atkSpdInc: skillParam_gen.constellation2[c2i++],
    duration: skillParam_gen.constellation2[c2i++],
    maxStack: skillParam_gen.constellation2[c2i++],
    cd: skillParam_gen.constellation2[c2i++],
  },
  constellation4: {
    dmgInc: skillParam_gen.constellation4[0],
  },
  constellation6: {
    duration: skillParam_gen.constellation6[c6i++],
    dmgInc: skillParam_gen.constellation6[c6i++],
    atkSpdInc: skillParam_gen.constellation6[c6i++],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  char: { ascension, constellation },
} = own
const { Burst, DilucC1, DilucC6 } = allBoolConditionals(info.key)
const { DilucC2 } = allNumConditionals(
  info.key,
  true,
  0,
  dm.constellation2.maxStack
)

const burstInfusionOn = cmpGE(Burst.ifOn(1), 1, 'infer', '')
const a4_pyro_dmg_ = Burst.ifOn(
  cmpGE(ascension, 4, percent(dm.passive2.pyroInc))
)
const c1_all_dmg_ = DilucC1.ifOn(
  cmpGE(constellation, 1, percent(dm.constellation1.dmgInc))
)
const c2_atk_ = cmpGE(
  constellation,
  2,
  prod(DilucC2, percent(dm.constellation2.atkInc))
)
const c2_atkSPD_ = cmpGE(
  constellation,
  2,
  prod(DilucC2, percent(dm.constellation2.atkSpdInc))
)
const c6_normal_dmg_ = DilucC6.ifOn(
  cmpGE(constellation, 6, percent(dm.constellation6.dmgInc))
)
const c6_atkSPD_ = DilucC6.ifOn(
  cmpGE(constellation, 6, percent(dm.constellation6.atkSpdInc))
)
const c4_skill_dmg_ = cmpGE(constellation, 4, percent(dm.constellation4.dmgInc))

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Fire and Steel (skill); C5 Searing Ember (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.dmg_.pyro.add(a4_pyro_dmg_),
  ownBuff.premod.atk_.add(c2_atk_),
  ownBuff.premod.atkSPD_.add(sum(c2_atkSPD_, c6_atkSPD_)),
  ownBuff.premod.dmg_.add(c1_all_dmg_),
  ownBuff.premod.dmg_.normal.add(c6_normal_dmg_),

  dm.normal.hitArr.flatMap((arr, i) => [
    ...dmg(`normal_${i}`, info, 'atk', arr, 'normal'),
    ...dmg(`normal_${i}_pyro`, info, 'atk', arr, 'normal', {
      ele: 'pyro',
      cond: burstInfusionOn,
    }),
  ]),
  dmg('charged_spin', info, 'atk', dm.charged.spinningDmg, 'charged'),
  dmg('charged_final', info, 'atk', dm.charged.finalDmg, 'charged'),
  dmg('charged_spin_pyro', info, 'atk', dm.charged.spinningDmg, 'charged', {
    ele: 'pyro',
    cond: burstInfusionOn,
  }),
  dmg('charged_final_pyro', info, 'atk', dm.charged.finalDmg, 'charged', {
    ele: 'pyro',
    cond: burstInfusionOn,
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) => [
    ...dmg(`plunging_${k}`, info, 'atk', v, 'plunging'),
    ...dmg(`plunging_${k}_pyro`, info, 'atk', v, 'plunging', {
      ele: 'pyro',
      cond: burstInfusionOn,
    }),
  ]),
  dmg('skill_first', info, 'atk', dm.skill.firstHit, 'skill'),
  dmg('skill_second', info, 'atk', dm.skill.secondHit, 'skill'),
  dmg('skill_third', info, 'atk', dm.skill.thridHit, 'skill'),
  dmg(
    'c4_second',
    info,
    'atk',
    dm.skill.secondHit,
    'skill',
    { cond: cmpGE(constellation, 4, 'infer', '') },
    ownBuff.premod.dmg_.skill.add(c4_skill_dmg_)
  ),
  dmg(
    'c4_third',
    info,
    'atk',
    dm.skill.thridHit,
    'skill',
    { cond: cmpGE(constellation, 4, 'infer', '') },
    ownBuff.premod.dmg_.skill.add(c4_skill_dmg_)
  ),
  dmg('burst_slash', info, 'atk', dm.burst.slashDmg, 'burst'),
  dmg('burst_dot', info, 'atk', dm.burst.dotDmg, 'burst'),
  dmg('burst_explosion', info, 'atk', dm.burst.explosionDmg, 'burst'),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('charged_duration', dm.charged.duration),
  customParam('skill_cd', dm.skill.cd),
  customParam('a1_staminaDec_', percent(dm.passive1.stamReduction), {
    cond: cmpGE(ascension, 1, 'infer', ''),
  }),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_enerCost', dm.burst.cost)
)
