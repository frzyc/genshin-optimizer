import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  allNumConditionals,
  customDmg,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'Ororon'
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
    dmg: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    activationDmg: skillParam_gen.burst[b++],
    soundwaveDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    nsPoint: skillParam_gen.passive1[0][0],
    dmg: skillParam_gen.passive1[1][0],
    ten: skillParam_gen.passive1[2][0],
    blessingDuration: skillParam_gen.passive1[3][0],
  },
  constellation1: {
    dmg_: skillParam_gen.constellation1[0],
    duration: skillParam_gen.constellation1[1],
  },
  constellation2: {
    electro_dmg_base: skillParam_gen.constellation2[0],
    electro_dmg_arr: [
      skillParam_gen.constellation2[0],
      skillParam_gen.constellation2[1],
      skillParam_gen.constellation2[2],
      skillParam_gen.constellation2[3],
    ],
    duration: skillParam_gen.constellation2[5],
  },
  constellation6: {
    atk_: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
    stacks: skillParam_gen.constellation6[2],
    dmg: skillParam_gen.constellation6[3],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
const { c1AfterSkillHit, c2Supersense } = allBoolConditionals(info.key)
const { c2BurstHitStack } = allNumConditionals(info.key, true, 0, 4)
const { c6Stacks } = allNumConditionals(info.key, true, 0, 3)

const c1AfterSkillHit_hypersense_dmg_ = c1AfterSkillHit.ifOn(
  cmpGE(constellation, 1, cmpGE(ascension, 1, percent(dm.constellation1.dmg_)))
)
const c2Supersense_electro_dmg_ = c2Supersense.ifOn(
  cmpGE(constellation, 2, percent(dm.constellation2.electro_dmg_base))
)
const c2BurstHitStack_electro_dmg_ = c2Supersense.ifOn(
  cmpGE(
    constellation,
    2,
    percent(
      subscript(c2BurstHitStack, [0, ...dm.constellation2.electro_dmg_arr])
    )
  )
)
const c6Stacks_atk_ = prod(
  cmpGE(constellation, 6, prod(percent(dm.constellation6.atk_), c6Stacks)),
  destIsActive
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Dark Voices Echo (burst); C5 Nightshade Synesthesia (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.dmg_.electro.add(
    sum(c2Supersense_electro_dmg_, c2BurstHitStack_electro_dmg_)
  ),
  teamBuff.premod.atk_.add(c6Stacks_atk_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_aimed', info, 'atk', dm.charged.aimed, 'charged', {
    ele: 'physical',
  }),
  dmg('charged_fullyAimed', info, 'atk', dm.charged.fullyAimed, 'charged', {
    ele: info.ele,
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.dmg, 'skill'),
  dmg('burst_activation', info, 'atk', dm.burst.activationDmg, 'burst'),
  dmg('burst_soundwave', info, 'atk', dm.burst.soundwaveDmg, 'burst'),
  customDmg(
    'a1_hypersense',
    info.ele,
    'elemental',
    prod(percent(dm.passive1.dmg), final.atk),
    { cond: cmpGE(ascension, 1, 'infer', '') },
    ownBuff.premod.dmg_.add(c1AfterSkillHit_hypersense_dmg_)
  ),
  customDmg(
    'c6',
    info.ele,
    'elemental',
    prod(percent(dm.passive1.dmg), final.atk, percent(dm.constellation6.dmg)),
    { cond: cmpGE(constellation, 6, 'infer', '') },
    ownBuff.premod.dmg_.add(c1AfterSkillHit_hypersense_dmg_)
  ),

  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
