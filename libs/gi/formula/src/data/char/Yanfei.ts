import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allNumConditionals,
  customDmg,
  customParam,
  customShield,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Yanfei'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
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
    dmgArr: [
      skillParam_gen.auto[a++], // 0 seals
      skillParam_gen.auto[a++], // 1 seal
      skillParam_gen.auto[a++], // 2 seals
      skillParam_gen.auto[a++], // 3 seals
      skillParam_gen.auto[a++], // 4 seals
    ],
    unknown: {
      arr: [
        skillParam_gen.auto[a++][0],
        skillParam_gen.auto[a++][0],
        skillParam_gen.auto[a++][0],
        skillParam_gen.auto[a++][0],
        skillParam_gen.auto[a++][0],
      ],
    },
    stamina: skillParam_gen.auto[a++][0],
    sealStaminaRed_: skillParam_gen.auto[a++][0],
    maxSeals: 3,
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  sealDuration: skillParam_gen.auto[a++][0],
  skill: {
    dmg: skillParam_gen.skill[0],
    cd: skillParam_gen.skill[1][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    charged_dmg_: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    sealInterval: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    seal_pyro_dmg_: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
  },
  passive2: {
    dmg: skillParam_gen.passive2[0][0],
  },
  c1: {
    sealStaminaRed_: skillParam_gen.constellation1[0],
  },
  c2: {
    hpThresh: skillParam_gen.constellation2[0],
    charged_critRate_: skillParam_gen.constellation2[1],
  },
  c4: {
    hpShield_: skillParam_gen.constellation4[0],
    duration: 15,
  },
  c6: {
    extraSeals: skillParam_gen.constellation6[0],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { burst, ascension, constellation },
} = own
const { afterBurst, c2EnemyHp } = allBoolConditionals(info.key)
const { p1Seals } = allNumConditionals(info.key, true, 0, 4)

const afterBurst_charged_dmg_ = afterBurst.ifOn(
  percent(talentSubscript(burst, dm.burst.charged_dmg_))
)
const p1_pyro_dmg_ = cmpGE(
  ascension,
  1,
  prod(p1Seals, percent(dm.passive1.seal_pyro_dmg_))
)
const c2EnemyHp_critRate_ = c2EnemyHp.ifOn(
  cmpGE(constellation, 2, percent(dm.c2.charged_critRate_))
)
const c4Shield = prod(percent(dm.c4.hpShield_), final.hp)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Justice, Unleashed (skill); C5 The Law Knows No Kindness (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.dmg_.charged.add(afterBurst_charged_dmg_),
  ownBuff.premod.critRate_.charged.add(c2EnemyHp_critRate_),
  ownBuff.premod.dmg_.pyro.add(p1_pyro_dmg_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dm.charged.dmgArr.flatMap((arr, i) =>
    dmg(`charged_${i}`, info, 'atk', arr, 'charged', {
      cond: i < 4 ? 'infer' : cmpGE(constellation, 6, 'infer', ''),
    })
  ),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.dmg, 'skill'),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst'),
  customDmg(
    'a4',
    info.ele,
    'charged',
    prod(percent(dm.passive2.dmg), final.atk),
    { cond: cmpGE(ascension, 4, 'infer', '') }
  ),
  customShield('c4_shield', undefined, c4Shield, {
    cond: cmpGE(constellation, 4, 'infer', ''),
  }),
  customShield('c4_pyroShield', 'pyro', c4Shield, {
    cond: cmpGE(constellation, 4, 'infer', ''),
  }),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('sealDuration', dm.sealDuration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_sealInterval', dm.burst.sealInterval),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
