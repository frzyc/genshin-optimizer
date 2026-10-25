import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod, sum } from '@genshin-optimizer/pando/engine'
import { infusionPrio } from '../common/dmg'
import {
  allBoolConditionals,
  customDmg,
  customHeal,
  customParam,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import {
  dataGenToCharInfo,
  dmg,
  entriesForChar,
  fixedShield,
  shield,
  talentSubscript,
} from './util'

const key: CharacterKey = 'Noelle'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0,
  p1 = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
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
    // Encoding {{N}} matches gen indices, not skillParams UI rows:
    // shield {{0}}+{{6}}, heal {{1}}+{{7}}, chance {{2}}, dur {{3}}, cd {{4}}, dmg {{5}}
    shieldDef: skillParam_gen.skill[s++],
    healDef: skillParam_gen.skill[s++],
    healChance: skillParam_gen.skill[s++],
    shieldDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    skillDmg: skillParam_gen.skill[s++],
    shieldFlat: skillParam_gen.skill[s++],
    healFlat: skillParam_gen.skill[s++],
  },
  burst: {
    burstDmg: skillParam_gen.burst[b++],
    skillDmg: skillParam_gen.burst[b++],
    defToAtk: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    hpThreshold: skillParam_gen.passive1[p1++][0],
    shield: skillParam_gen.passive1[p1++][0],
    duration: skillParam_gen.passive1[p1++][0],
    cooldown: skillParam_gen.passive1[p1++][0],
  },
  constellation1: {
    healingChance: skillParam_gen.constellation1[0],
  },
  constellation2: {
    chargeStamina: skillParam_gen.constellation2[0],
    chargeDmg_: skillParam_gen.constellation2[1],
  },
  constellation4: {
    skillDmg: skillParam_gen.constellation4[0],
  },
  constellation6: {
    burstAtkBonus: skillParam_gen.constellation6[0],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, burst, ascension, constellation },
} = own
// WR cond(key, 'SweepingTime')
const { SweepingTime } = allBoolConditionals(info.key)

// Read DEF at sheet:agg so this premod.atk write does not cycle through final.def.
const burstAtkFromDef = SweepingTime.ifOn(
  prod(
    own.premod.def.sheet('agg'),
    sum(
      percent(talentSubscript(burst, dm.burst.defToAtk)),
      cmpGE(constellation, 6, percent(dm.constellation6.burstAtkBonus))
    )
  )
)
const c2ChargedDmg_ = cmpGE(
  constellation,
  2,
  percent(dm.constellation2.chargeDmg_)
)
// WR: percent(-dm.chargeStamina); dm value is already negative.
const c2StaminaChargedDec_ = cmpGE(
  constellation,
  2,
  percent(-dm.constellation2.chargeStamina)
)
const healChanceBase = percent(talentSubscript(skill, dm.skill.healChance))
const skillHealChance = cmpGE(
  constellation,
  1,
  SweepingTime.ifOn(percent(dm.constellation1.healingChance), healChanceBase),
  healChanceBase
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Breastplate (skill); C5 Sweeping Time (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.atk.add(burstAtkFromDef),
  ownBuff.premod.dmg_.charged.add(c2ChargedDmg_),
  ownBuff.premod.staminaChargedDec_.add(c2StaminaChargedDec_),
  ownBuff.reaction.infusionIndex.add(
    SweepingTime.ifOn(infusionPrio.nonOverridable.geo)
  ),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_spinning', info, 'atk', dm.charged.spinningDmg, 'charged'),
  dmg('charged_final', info, 'atk', dm.charged.finalDmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'def', dm.skill.skillDmg, 'skill'),
  shield(
    'skill_shield',
    'def',
    dm.skill.shieldDef,
    dm.skill.shieldFlat,
    'skill',
    { ele: 'geo' }
  ),
  customHeal(
    'skill_heal',
    sum(
      prod(percent(talentSubscript(skill, dm.skill.healDef)), final.def),
      talentSubscript(skill, dm.skill.healFlat)
    )
  ),
  dmg('burst', info, 'atk', dm.burst.burstDmg, 'burst'),
  dmg('burst_skill', info, 'atk', dm.burst.skillDmg, 'burst'),
  customParam('burst_atkFromDef', burstAtkFromDef),
  fixedShield('a1_shield', 'def', percent(dm.passive1.shield), 0, {
    ele: 'geo',
    cond: cmpGE(ascension, 1, 'infer', ''),
  }),
  customDmg(
    'c4',
    info.ele,
    'elemental',
    prod(final.atk, percent(dm.constellation4.skillDmg)),
    { cond: cmpGE(constellation, 4, 'infer', '') }
  ),

  // Kit param rows (skillParams + encoding / in-game labels)
  customParam('charged_stamina', dm.charged.stamina),
  customParam('charged_duration', dm.charged.duration),
  customParam('skill_healChance', skillHealChance),
  customParam('skill_duration', dm.skill.shieldDuration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost),
  customParam('a1_duration', dm.passive1.duration, {
    cond: cmpGE(ascension, 1, 'infer', ''),
  }),
  customParam('a1_cd', dm.passive1.cooldown, {
    cond: cmpGE(ascension, 1, 'infer', ''),
  }),
  customParam('c2_charged_dmg_', c2ChargedDmg_, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  }),
  customParam('c2_staminaChargedDec_', c2StaminaChargedDec_, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  })
)
