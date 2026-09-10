import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  customHeal,
  customParam,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, fixedShield } from './util'

const key: CharacterKey = 'Kaeya'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
    ],
  },
  charged: {
    dmg1: skillParam_gen.auto[a++],
    dmg2: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
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
    dmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive2: {
    healAtk_: 0.15,
  },
  constellation1: {
    critRate_: 0.15,
  },
  constellation4: {
    shieldHp_: 0.3,
    duration: 20,
    cooldown: 60,
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
// WR cond(key, 'CryoC1')
const { CryoC1 } = allBoolConditionals(info.key)

const c1CritRate_ = cmpGE(
  constellation,
  1,
  CryoC1.ifOn(percent(dm.constellation1.critRate_))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Frostgnaw (skill); C5 Glacial Waltz (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.critRate_.normal.add(c1CritRate_),
  ownBuff.premod.critRate_.charged.add(c1CritRate_),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_dmg1', info, 'atk', dm.charged.dmg1, 'charged'),
  dmg('charged_dmg2', info, 'atk', dm.charged.dmg2, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.dmg, 'skill'),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst'),
  // WR A1 heal uses dm.passive2.healAtk_ (kit text is passive1)
  customHeal('a1_heal', prod(percent(dm.passive2.healAtk_), final.atk), {
    cond: cmpGE(ascension, 1, 'infer', ''),
  }),
  fixedShield('c4_shield', 'hp', percent(dm.constellation4.shieldHp_), 0, {
    cond: cmpGE(constellation, 4, 'infer', ''),
  }),
  fixedShield('c4_cryoShield', 'hp', percent(dm.constellation4.shieldHp_), 0, {
    ele: 'cryo',
    cond: cmpGE(constellation, 4, 'infer', ''),
  }),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_enerCost', dm.burst.enerCost),
  customParam('c4_duration', dm.constellation4.duration, {
    cond: cmpGE(constellation, 4, 'infer', ''),
  }),
  customParam('c4_cd', dm.constellation4.cooldown, {
    cond: cmpGE(constellation, 4, 'infer', ''),
  })
)
