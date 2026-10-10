import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpNE, prod, sum } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  allListConditionals,
  customHeal,
  customParam,
  customShield,
  hexereiTally,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Diona'
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
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
    ],
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    aimedCharged: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    icyPawDmg: skillParam_gen.skill[s++],
    shieldHp_: skillParam_gen.skill[s++],
    shieldFlat: skillParam_gen.skill[s++],
    cdPress: skillParam_gen.skill[s++][0],
    cdHold: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    fieldDmg: skillParam_gen.burst[b++],
    healHp_: skillParam_gen.burst[b++],
    healBase: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
  },
  passive1: {
    moveSpeed_: skillParam_gen.passive1[p1++][0], //+10% move speed
    stamRed_: skillParam_gen.passive1[p1++][0], //Stamina consumption reduced by 10%
  },
  passive2: {
    atkRed_: skillParam_gen.passive1[p2++][0], //Opponents inside burst -10% attack
    duration: skillParam_gen.passive1[p2++][0],
  },
  constellation1: {
    energyRegen: skillParam_gen.constellation1[0],
  },
  constellation2: {
    icyPawDmg_: skillParam_gen.constellation2[0], //Icy Paws +15% dmg
    icyPawShield_: skillParam_gen.constellation2[1], //Icy paws +15% shield
    coopShield_: skillParam_gen.constellation2[2], //Coop shield 50% of total shield
    coopShieldDuration_: skillParam_gen.constellation2[3], //Coop shield lasts for 5s
  },
  constellation6: {
    healingBonus_: skillParam_gen.constellation6[0],
    emBonus: skillParam_gen.constellation6[1],
    hp_: skillParam_gen.constellation6[2],
    sc_dmg_: skillParam_gen.constellation6[3],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, burst, ascension, constellation },
} = own
// WR cond(key, 'lockRevelation' | 'Ascension1' | 'Constellation6' | 'lockStellarRadianceSc')
const { lockRevelation, Ascension1 } = allBoolConditionals(info.key)
const { Constellation6 } = allListConditionals(info.key, ['lower', 'higher'])
const { lockStellarRadianceSc } = allListConditionals(info.key, ['on', 'ss'])

const holdSkillShieldStr_ = percent(1.75)
const c2ShieldStr_ = sum(
  percent(1),
  cmpGE(constellation, 2, percent(dm.constellation2.icyPawShield_))
)
const skillShield = sum(
  prod(percent(talentSubscript(skill, dm.skill.shieldHp_)), final.hp),
  talentSubscript(skill, dm.skill.shieldFlat)
)
const pressShield = prod(c2ShieldStr_, skillShield)
const holdShield = prod(c2ShieldStr_, holdSkillShieldStr_, skillShield)
const c2PressShield = prod(percent(dm.constellation2.coopShield_), pressShield)
const c2HoldShield = prod(percent(dm.constellation2.coopShield_), holdShield)

const c2_skill_dmg_ = cmpGE(
  constellation,
  2,
  percent(dm.constellation2.icyPawDmg_)
)
// Pando has no staminaDec_ tag (only staminaChargedDec_). Display-only listing.
const a1_staminaDec_ = Ascension1.ifOn(
  cmpGE(ascension, 1, percent(dm.passive1.stamRed_))
)
const a1_moveSPD_ = Ascension1.ifOn(
  cmpGE(ascension, 1, percent(dm.passive1.moveSpeed_))
)

const c6OnField = cmpNE(Constellation6.value, 0, 1)
const c6_hp_ = lockRevelation.ifOn(
  cmpGE(constellation, 6, percent(dm.constellation6.hp_))
)
const c6_incHeal_ = cmpNE(
  destIsActive,
  0,
  cmpGE(
    constellation,
    6,
    percent(
      Constellation6.map({ lower: dm.constellation6.healingBonus_, higher: 0 })
    )
  )
)
const c6_eleMas = cmpNE(
  destIsActive,
  0,
  cmpGE(
    constellation,
    6,
    Constellation6.map({ lower: 0, higher: dm.constellation6.emBonus })
  )
)
const c6ReactionDmg_ = cmpNE(
  destIsActive,
  0,
  cmpGE(
    constellation,
    6,
    lockRevelation.ifOn(prod(c6OnField, percent(dm.constellation6.sc_dmg_)))
  )
)
const c6_sc_dmg_ = prod(
  c6ReactionDmg_,
  lockStellarRadianceSc.map({ on: 1, ss: 0 })
)
const c6_ss_dmg_ = prod(
  c6ReactionDmg_,
  lockStellarRadianceSc.map({ on: 0, ss: 1 })
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  hexereiTally(lockRevelation.ifOn(1)),
  // C3 Signature Mix (burst); C5 Icy Paws (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.dmg_.skill.add(c2_skill_dmg_),
  ownBuff.premod.hp_.add(c6_hp_),
  teamBuff.premod.moveSPD_.add(a1_moveSPD_),
  teamBuff.premod.incHeal_.add(c6_incHeal_),
  teamBuff.premod.eleMas.add(c6_eleMas),
  teamBuff.premod.dmg_.superconduct.add(c6_sc_dmg_),
  teamBuff.premod.dmg_.stellarconduct.add(c6_sc_dmg_),
  teamBuff.premod.dmg_.swirl.add(c6_ss_dmg_),
  teamBuff.premod.dmg_.stellarswirl.add(c6_ss_dmg_),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_aimed', info, 'atk', dm.charged.aimed, 'charged', {
    ele: 'physical',
  }),
  dmg('charged_aimedCharged', info, 'atk', dm.charged.aimedCharged, 'charged', {
    ele: 'cryo',
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.icyPawDmg, 'skill'),
  customShield('pressShield', undefined, pressShield),
  customShield('pressCryoShield', 'cryo', pressShield),
  customShield('holdShield', undefined, holdShield),
  customShield('holdCryoShield', 'cryo', holdShield),
  dmg('burst', info, 'atk', dm.burst.skillDmg, 'burst'),
  dmg('burst_field', info, 'atk', dm.burst.fieldDmg, 'burst'),
  customHeal(
    'burst_heal',
    sum(
      prod(percent(talentSubscript(burst, dm.burst.healHp_)), final.hp),
      talentSubscript(burst, dm.burst.healBase)
    )
  ),
  customShield('c2_pressShield', undefined, c2PressShield, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  }),
  customShield('c2_pressCryoShield', 'cryo', c2PressShield, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  }),
  customShield('c2_holdShield', undefined, c2HoldShield, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  }),
  customShield('c2_holdCryoShield', 'cryo', c2HoldShield, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  }),

  // Kit param rows (skillParams + encoding / in-game labels)
  customParam('skill_duration', talentSubscript(skill, dm.skill.duration)),
  customParam('skill_cdPress', dm.skill.cdPress),
  customParam('skill_cdHold', dm.skill.cdHold),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost),
  customParam('a1_staminaDec_', a1_staminaDec_, {
    cond: cmpGE(ascension, 1, 'infer', ''),
  }),
  customParam('c2_duration', dm.constellation2.coopShieldDuration_, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  })
)
