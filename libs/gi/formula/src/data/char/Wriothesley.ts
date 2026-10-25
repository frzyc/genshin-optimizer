import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allNumConditionals,
  customDmg,
  customHeal,
  customParam,
  hexereiTally,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Wriothesley'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = -1,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[++a], // 1
      skillParam_gen.auto[++a], // 2
      skillParam_gen.auto[++a], // 3
      skillParam_gen.auto[(a += 2)], // 4x2
      skillParam_gen.auto[++a], // 5
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[++a],
    stam: skillParam_gen.auto[++a][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  skill: {
    fistDmg: skillParam_gen.skill[s++],
    hpCost: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    bladeDmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    bladeCd: skillParam_gen.burst[b++][0],
  },
  passive1: {
    hpThresh: skillParam_gen.passive1[0][0],
    dmg_: skillParam_gen.passive1[1][0],
    hpRestore: skillParam_gen.passive1[2][0],
    cd: skillParam_gen.passive1[3][0],
  },
  passive2: {
    atk_: skillParam_gen.passive2[0][0],
    maxStacks: skillParam_gen.passive2[1][0],
  },
  lockedPassive: {
    hpThresh: skillParam_gen.lockedPassive![0][0],
    heal: skillParam_gen.lockedPassive![1][0],
    cd: skillParam_gen.lockedPassive![2][0],
    stellarconduct_dmg_: skillParam_gen.lockedPassive![3][0],
    hit3AddlMult_: skillParam_gen.lockedPassive![4][0],
    hit5AddlMult_: skillParam_gen.lockedPassive![5][0],
  },
  constellation1: {
    cd: skillParam_gen.constellation1[0],
    dmg_: skillParam_gen.constellation1[1],
    durationInc: skillParam_gen.constellation1[2],
    hit5_stellarconduct_dmg_: skillParam_gen.constellation1[3],
    luster_dmg_: skillParam_gen.constellation1[4],
    duration: skillParam_gen.constellation1[5],
  },
  constellation2: {
    dmg_: skillParam_gen.constellation2[0],
    normal_mult_: skillParam_gen.constellation2[1],
    charged_mult_: skillParam_gen.constellation2[2],
    hit3AddlMult_: skillParam_gen.constellation2[3],
    hit5AddlMult_: skillParam_gen.constellation2[4],
    lusterAddlMult_: skillParam_gen.constellation2[5],
  },
  constellation4: {
    selfAtkSPD_: skillParam_gen.constellation4[0],
    selfDuration: skillParam_gen.constellation4[1],
    teamAtkSPD_: skillParam_gen.constellation4[2],
    teamDuration: skillParam_gen.constellation4[3],
    heal: skillParam_gen.constellation4[4],
    dmgRed_: skillParam_gen.constellation4[5],
    selfAtkSPD2_: skillParam_gen.constellation4[6],
    teamAtkSPD2_: skillParam_gen.constellation4[7],
  },
  constellation6: {
    skill_critRate_: skillParam_gen.constellation6[0],
    skill_critDMG_: skillParam_gen.constellation6[1],
    icicle_dmg_: skillParam_gen.constellation6[2],
    fist_critRate_: skillParam_gen.constellation6[3],
    fist_critDMG_: skillParam_gen.constellation6[4],
    stellarDmg: skillParam_gen.constellation6[5],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { auto, skill, ascension, constellation },
} = own
const { lockRevelation, lockStellarRadianceSc } = allBoolConditionals(info.key)
const { a4EdictStacks } = allNumConditionals(
  info.key,
  true,
  0,
  dm.passive2.maxStacks
)

const hexOn = lockRevelation.ifOn(1)
const radianceOn = lockStellarRadianceSc.ifOn(1)
const a4EdictStacks_atk_ = cmpGE(
  ascension,
  4,
  prod(a4EdictStacks, percent(dm.passive2.atk_))
)
const c2EdictStacks_burst_dmg_ = cmpGE(
  constellation,
  2,
  cmpGE(ascension, 4, prod(a4EdictStacks, percent(dm.constellation2.dmg_)))
)
const a1Stellarconduct_dmg_ = cmpGE(
  ascension,
  1,
  prod(hexOn, radianceOn, dm.lockedPassive.stellarconduct_dmg_)
)
const rebuke_dmg_ = sum(
  cmpGE(ascension, 1, percent(dm.passive1.dmg_)),
  cmpGE(constellation, 1, percent(dm.constellation1.dmg_))
)
const a1Heal_ = cmpGE(
  constellation,
  4,
  dm.constellation4.heal + dm.passive1.hpRestore,
  dm.passive1.hpRestore
)
const c6Rebuke_critRate_ = cmpGE(
  constellation,
  6,
  dm.constellation6.skill_critRate_
)
const c6Rebuke_critDMG_ = cmpGE(
  constellation,
  6,
  dm.constellation6.skill_critDMG_
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  hexereiTally(hexOn),
  // C3 Darkgold Wolfbite (auto); C5 Rebuke: Vaulting Fist (burst)
  ownBuff.char.auto.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.atk_.add(a4EdictStacks_atk_),
  ownBuff.premod.dmg_.burst.add(c2EdictStacks_burst_dmg_),
  ownBuff.premod.dmg_.stellarconduct.add(a1Stellarconduct_dmg_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  dmg(
    'charged_rebuke',
    info,
    'atk',
    dm.charged.dmg,
    'charged',
    { cond: cmpGE(ascension, 1, 'infer', '') },
    ownBuff.premod.dmg_.charged.add(rebuke_dmg_),
    ownBuff.premod.critRate_.charged.add(c6Rebuke_critRate_),
    ownBuff.premod.critDMG_.charged.add(c6Rebuke_critDMG_)
  ),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dm.normal.hitArr.flatMap((arr, i) =>
    customDmg(
      `skill_enhanced_${i}`,
      info.ele,
      'normal',
      prod(
        percent(talentSubscript(auto, arr)),
        percent(talentSubscript(skill, dm.skill.fistDmg)),
        final.atk
      )
    )
  ),
  customParam('skill_hpCost', prod(percent(dm.skill.hpCost), final.hp)),
  dmg('burst', info, 'atk', dm.burst.skillDmg, 'burst'),
  dmg('burst_blade', info, 'atk', dm.burst.bladeDmg, 'burst'),
  customHeal('a1_heal', prod(percent(a1Heal_), final.hp), {
    cond: cmpGE(ascension, 1, 'infer', ''),
  }),
  customParam('c4_dmgRed_', percent(dm.constellation4.dmgRed_), {
    cond: cmpGE(constellation, 4, 'infer', ''),
  }),

  customParam('charged_stam', dm.charged.stam),
  customParam('skill_duration', dm.skill.duration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost),
  customParam('burst_bladeCd', dm.burst.bladeCd)
)
