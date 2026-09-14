import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allListConditionals,
  customDmg,
  customHeal,
  customParam,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Gaming'
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
      skillParam_gen.auto[a++], // 4
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
    cloudstriderDmg: skillParam_gen.skill[s++],
    hpCost: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    smashDmg: skillParam_gen.burst[b++],
    heal: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    duration: skillParam_gen.passive1[0][0],
    heal: skillParam_gen.passive1[1][0],
  },
  passive2: {
    threshold: skillParam_gen.passive2[0][0],
    heal_: skillParam_gen.passive2[1][0],
    cloudstrider_dmg_: skillParam_gen.passive2[2][0],
  },
  constellation1: {
    heal: skillParam_gen.constellation1[0],
  },
  constellation2: {
    atk_: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
  },
  constellation4: {
    energyRegen: skillParam_gen.constellation4[0],
  },
  constellation6: {
    skill_critRate_: skillParam_gen.constellation6[0],
    skill_critDMG_: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, ascension, constellation },
} = own
// WR cond(key, 'a4HpState' | 'c2Overheal')
const { c2Overheal } = allBoolConditionals(info.key)
const { a4HpState } = allListConditionals(info.key, ['below', 'above'])

const a4HpState_heal_ = cmpGE(
  ascension,
  4,
  percent(a4HpState.map({ below: dm.passive2.heal_, above: 0 }))
)
const a4HpState_cloudstrider_dmg_ = cmpGE(
  ascension,
  4,
  percent(a4HpState.map({ below: 0, above: dm.passive2.cloudstrider_dmg_ }))
)
const c6_cloudstrider_critRate_ = cmpGE(
  constellation,
  6,
  percent(dm.constellation6.skill_critRate_)
)
const c6_cloudstrider_critDMG_ = cmpGE(
  constellation,
  6,
  percent(dm.constellation6.skill_critDMG_)
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Bestial Ascent (skill); C5 Suanni's Gilded Dance (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  // A4 Incoming Healing Bonus (own; Cloudstrider plunging_dmg_ is listing-local)
  ownBuff.premod.heal_.add(a4HpState_heal_),
  // C2 ATK% after overflow heal (own)
  ownBuff.premod.atk_.add(
    c2Overheal.ifOn(cmpGE(constellation, 2, percent(dm.constellation2.atk_)))
  ),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_cyclic', info, 'atk', dm.charged.cyclicDmg, 'charged'),
  dmg('charged_final', info, 'atk', dm.charged.finalDmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  // WR customDmgNode: skill talent × ATK, move plunging_impact, ele pyro
  customDmg(
    'skill_cloudstrider',
    'pyro',
    'plunging',
    prod(percent(talentSubscript(skill, dm.skill.cloudstriderDmg)), final.atk),
    undefined,
    ownBuff.premod.dmg_.plunging.add(a4HpState_cloudstrider_dmg_),
    ownBuff.premod.critRate_.plunging.add(c6_cloudstrider_critRate_),
    ownBuff.premod.critDMG_.plunging.add(c6_cloudstrider_critDMG_)
  ),
  customParam('skill_hpCost', prod(percent(dm.skill.hpCost), final.hp)),
  dmg('burst', info, 'atk', dm.burst.smashDmg, 'burst'),
  customHeal('burst_heal', prod(percent(dm.burst.heal), final.hp)),
  customHeal('a1_heal', prod(percent(dm.passive1.heal), final.hp), {
    cond: cmpGE(ascension, 1, 'infer', ''),
  }),
  customHeal('c1_heal', prod(percent(dm.constellation1.heal), final.hp), {
    cond: cmpGE(constellation, 1, 'infer', ''),
  }),

  customParam('charged_stam', dm.charged.stam),
  customParam('charged_duration', dm.charged.duration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
