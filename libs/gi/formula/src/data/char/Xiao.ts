import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  customParam,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Xiao'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[0], // 1
      skillParam_gen.auto[2], // 2
      skillParam_gen.auto[3], // 3
      skillParam_gen.auto[4], // 4
      skillParam_gen.auto[6], // 5
      skillParam_gen.auto[7], // 6
    ],
  },
  charged: {
    dmg1: skillParam_gen.auto[8], // 1
    stamina: skillParam_gen.auto[9][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[10],
    low: skillParam_gen.auto[11],
    high: skillParam_gen.auto[12],
  },
  skill: {
    press: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmgBonus: skillParam_gen.burst[b++],
    drain: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    dmgBonus: skillParam_gen.passive1[0][0],
  },
  passive2: {
    duration: skillParam_gen.passive2[0][0],
    skillDmgBonus: skillParam_gen.passive2[1][0],
    maxStacks: skillParam_gen.passive2[2][0],
  },
  passive3: {
    staminaClimbingDec_: 0.2,
  },
  constellation2: {
    enerRech_: skillParam_gen.constellation2[0],
  },
  constellation4: {
    hpThresh: skillParam_gen.constellation4[0],
    def_: skillParam_gen.constellation4[1],
  },
  constellation6: {
    duration: skillParam_gen.constellation6[0],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  char: { burst, ascension, constellation },
} = own
const { offField } = allBoolConditionals(info.key)
const { inBurst } = allListConditionals(info.key, ['inBurst'])
const { c4BelowHP } = allListConditionals(info.key, ['c4BelowHP'])
const { a1BurstStack } = allListConditionals(info.key, [
  '0',
  '1',
  '2',
  '3',
  '4',
])
const { a4SkillStack } = allNumConditionals(
  info.key,
  true,
  0,
  dm.passive2.maxStacks
)

const inBurstOn = inBurst.map({ inBurst: 1 })
const infusionOn = cmpGE(inBurstOn, 1, 'infer', '')
const burst_auto_dmg_ = prod(
  inBurstOn,
  percent(talentSubscript(burst, dm.burst.dmgBonus))
)
const a1_all_dmg_ = prod(
  inBurstOn,
  cmpGE(
    ascension,
    1,
    prod(
      percent(dm.passive1.dmgBonus),
      a1BurstStack.map({ '0': 1, '1': 2, '2': 3, '3': 4, '4': 5 })
    )
  )
)
const a4_skill_dmg_ = cmpGE(
  ascension,
  4,
  prod(a4SkillStack, percent(dm.passive2.skillDmgBonus))
)
const c2_enerRech_ = offField.ifOn(
  cmpGE(constellation, 2, percent(dm.constellation2.enerRech_))
)
const c4_def_ = cmpGE(
  constellation,
  4,
  percent(c4BelowHP.map({ c4BelowHP: dm.constellation4.def_ }))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Conqueror of Evil: Wrath Deity (skill); C5 Evolution, Extinction (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.dmg_.normal.add(burst_auto_dmg_),
  ownBuff.premod.dmg_.charged.add(burst_auto_dmg_),
  ownBuff.premod.dmg_.plunging.add(burst_auto_dmg_),
  ownBuff.premod.dmg_.add(a1_all_dmg_),
  ownBuff.premod.dmg_.skill.add(a4_skill_dmg_),
  ownBuff.premod.enerRech_.add(c2_enerRech_),
  ownBuff.premod.def_.add(c4_def_),

  dm.normal.hitArr.flatMap((arr, i) => [
    ...dmg(`normal_${i}`, info, 'atk', arr, 'normal'),
    ...dmg(`normal_${i}_anemo`, info, 'atk', arr, 'normal', {
      ele: 'anemo',
      cond: infusionOn,
    }),
  ]),
  dmg('charged', info, 'atk', dm.charged.dmg1, 'charged'),
  dmg('charged_anemo', info, 'atk', dm.charged.dmg1, 'charged', {
    ele: 'anemo',
    cond: infusionOn,
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) => [
    ...dmg(`plunging_${k}`, info, 'atk', v, 'plunging'),
    ...dmg(`plunging_${k}_anemo`, info, 'atk', v, 'plunging', {
      ele: 'anemo',
      cond: infusionOn,
    }),
  ]),
  dmg('skill', info, 'atk', dm.skill.press, 'skill'),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_drain', talentSubscript(burst, dm.burst.drain)),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost),
  customParam(
    'p3_staminaClimbingDec_',
    percent(dm.passive3.staminaClimbingDec_)
  )
)
