import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, min, prod } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allListConditionals,
  customDmg,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'Tighnari'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0,
  p1 = 0,
  p2 = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3x2
      skillParam_gen.auto[a++], // 4
    ],
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    aimedCharged: skillParam_gen.auto[a++],
    wreathArrow: skillParam_gen.auto[a++],
    clusterArrow: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    fieldDuration: skillParam_gen.skill[s++][0],
    penetratorDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    primaryDmg: skillParam_gen.burst[b++],
    secondaryDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    energyCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    eleMas: skillParam_gen.passive1[p1++][0],
    duration: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    charged_burst_dmg_: skillParam_gen.passive2[p2++][0],
    maxDmg_: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    charged_critRate_: skillParam_gen.constellation1[0],
  },
  constellation2: {
    dendro_dmg_: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
  },
  constellation4: {
    eleMas: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    unknown: skillParam_gen.constellation6[0],
    dmg: skillParam_gen.constellation6[1],
    chargeTimeRed: 0.9,
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
const { p1AfterWreath, c2EnemyField } = allBoolConditionals(info.key)
const { c4 } = allListConditionals(info.key, ['after', 'react'])

const a1AfterWreath_eleMas = p1AfterWreath.ifOn(
  cmpGE(ascension, 1, dm.passive1.eleMas)
)
const a4_charged_burst_dmg_ = cmpGE(
  ascension,
  4,
  min(
    prod(percent(dm.passive2.charged_burst_dmg_), final.eleMas),
    percent(dm.passive2.maxDmg_)
  )
)
const c1_charged_critRate_ = cmpGE(
  constellation,
  1,
  percent(dm.constellation1.charged_critRate_)
)
const c2EnemyField_dendro_dmg_ = c2EnemyField.ifOn(
  cmpGE(constellation, 2, percent(dm.constellation2.dendro_dmg_))
)
const c4_eleMas = cmpGE(
  constellation,
  4,
  c4.map({
    after: dm.constellation4.eleMas,
    react: dm.constellation4.eleMas * 2,
  })
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 All Things Are of the Earth (burst); C5 Discerning Eye (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.eleMas.add(a1AfterWreath_eleMas),
  ownBuff.premod.dmg_.charged.add(a4_charged_burst_dmg_),
  ownBuff.premod.dmg_.burst.add(a4_charged_burst_dmg_),
  ownBuff.premod.critRate_.charged.add(c1_charged_critRate_),
  ownBuff.premod.dmg_.dendro.add(c2EnemyField_dendro_dmg_),
  teamBuff.premod.eleMas.add(c4_eleMas),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_aimed', info, 'atk', dm.charged.aimed, 'charged', {
    ele: 'physical',
  }),
  dmg('charged_aimedCharged', info, 'atk', dm.charged.aimedCharged, 'charged', {
    ele: 'dendro',
  }),
  dmg('charged_wreath', info, 'atk', dm.charged.wreathArrow, 'charged', {
    ele: 'dendro',
  }),
  dmg('charged_cluster', info, 'atk', dm.charged.clusterArrow, 'charged', {
    ele: 'dendro',
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.dmg, 'skill'),
  dmg('burst_primary', info, 'atk', dm.burst.primaryDmg, 'burst'),
  dmg('burst_secondary', info, 'atk', dm.burst.secondaryDmg, 'burst'),
  customDmg(
    'c6_cluster',
    info.ele,
    'charged',
    prod(percent(dm.constellation6.dmg), final.atk),
    { cond: cmpGE(constellation, 6, 'infer', '') }
  ),

  customParam('skill_fieldDuration', dm.skill.fieldDuration),
  customParam('skill_penetratorDuration', dm.skill.penetratorDuration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.energyCost)
)
