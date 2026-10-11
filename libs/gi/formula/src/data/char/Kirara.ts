import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allElementKeys } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  customDmg,
  customParam,
  customShield,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import {
  dataGenToCharInfo,
  dmg,
  entriesForChar,
  shield,
  talentSubscript,
} from './util'

const key: CharacterKey = 'Kirara'
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
      skillParam_gen.auto[a++], // 3.1
      skillParam_gen.auto[a++], // 3.2
      skillParam_gen.auto[a++], // 4
    ],
  },
  charged: {
    dmg1: skillParam_gen.auto[a++],
    dmg2: skillParam_gen.auto[a++],
    dmg3: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    tailDmg: skillParam_gen.skill[s++],
    shield_hp_: skillParam_gen.skill[s++],
    shield_base: skillParam_gen.skill[s++],
    maxShield_hp_: skillParam_gen.skill[s++],
    maxShield_base: skillParam_gen.skill[s++],
    shieldDuration: skillParam_gen.skill[s++][0],
    parcelDmg: skillParam_gen.skill[s++],
    parcelDuration: skillParam_gen.skill[s++][0],
    strikeDmg: skillParam_gen.skill[s++],
    cdMin: skillParam_gen.skill[s++][0],
    cdMax: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    explosionDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    shieldMult_: skillParam_gen.passive1[0][0],
    maxStacks: skillParam_gen.passive1[1][0],
    cd: skillParam_gen.passive1[2][0],
  },
  passive2: {
    skill_dmg_: skillParam_gen.passive2[0][0],
    burst_dmg_: skillParam_gen.passive2[1][0],
  },
  constellation1: {
    hpThresh: 1 / skillParam_gen.constellation1[0],
  },
  constellation2: {
    shieldMult_: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
    cd: skillParam_gen.constellation2[2],
  },
  constellation4: {
    dmg: skillParam_gen.constellation4[0],
    cd: skillParam_gen.constellation4[1],
  },
  constellation6: {
    all_dmg_: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, ascension, constellation },
} = own
// WR cond(key, 'c6AfterSkillBurst')
const { c6AfterSkillBurst } = allBoolConditionals(info.key)

// A4: WR prod(percent(...), input.total.hp, 1/1000). dmg_ does not feed HP.
const a4_skill_dmg_ = cmpGE(
  ascension,
  4,
  prod(percent(dm.passive2.skill_dmg_), final.hp, 1 / 1000)
)
const a4_burst_dmg_ = cmpGE(
  ascension,
  4,
  prod(percent(dm.passive2.burst_dmg_), final.hp, 1 / 1000)
)
const c6_all_dmg_ = c6AfterSkillBurst.ifOn(
  cmpGE(constellation, 6, percent(dm.constellation6.all_dmg_))
)

// WR shieldNodeTalent multiplier applies to the HP% term only (flat stays full).
const p1Shield = sum(
  prod(
    percent(talentSubscript(skill, dm.skill.shield_hp_)),
    final.hp,
    percent(dm.passive1.shieldMult_)
  ),
  talentSubscript(skill, dm.skill.shield_base)
)
const maxSkillShield = sum(
  prod(percent(talentSubscript(skill, dm.skill.maxShield_hp_)), final.hp),
  talentSubscript(skill, dm.skill.maxShield_base)
)
const c2Shield = prod(percent(dm.constellation2.shieldMult_), maxSkillShield)
const extraCardamom = cmpGE(
  constellation,
  1,
  cmpGE(
    final.hp,
    dm.constellation1.hpThresh * 4,
    4,
    cmpGE(
      final.hp,
      dm.constellation1.hpThresh * 3,
      3,
      cmpGE(
        final.hp,
        dm.constellation1.hpThresh * 2,
        2,
        cmpGE(final.hp, dm.constellation1.hpThresh, 1, 0)
      )
    )
  )
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Meow-teor Kick (skill); C5 Secret Art: Surprise Dispatch (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.dmg_.skill.add(a4_skill_dmg_),
  ownBuff.premod.dmg_.burst.add(a4_burst_dmg_),
  allElementKeys.map((ele) => teamBuff.premod.dmg_[ele].add(c6_all_dmg_)),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_dmg1', info, 'atk', dm.charged.dmg1, 'charged'),
  dmg('charged_dmg2', info, 'atk', dm.charged.dmg2, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_tail', info, 'atk', dm.skill.tailDmg, 'skill'),
  shield(
    'skill_shield',
    'hp',
    dm.skill.shield_hp_,
    dm.skill.shield_base,
    'skill'
  ),
  shield(
    'skill_dendroShield',
    'hp',
    dm.skill.shield_hp_,
    dm.skill.shield_base,
    'skill',
    { ele: 'dendro' }
  ),
  shield(
    'skill_maxShield',
    'hp',
    dm.skill.maxShield_hp_,
    dm.skill.maxShield_base,
    'skill'
  ),
  shield(
    'skill_maxDendroShield',
    'hp',
    dm.skill.maxShield_hp_,
    dm.skill.maxShield_base,
    'skill',
    { ele: 'dendro' }
  ),
  dmg('skill_parcel', info, 'atk', dm.skill.parcelDmg, 'skill'),
  dmg('skill_strike', info, 'atk', dm.skill.strikeDmg, 'skill'),
  dmg('burst', info, 'atk', dm.burst.skillDmg, 'burst'),
  dmg('burst_explosion', info, 'atk', dm.burst.explosionDmg, 'burst'),
  customShield('a1_shield', undefined, p1Shield, {
    cond: cmpGE(ascension, 1, 'infer', ''),
  }),
  customShield('a1_dendroShield', 'dendro', p1Shield, {
    cond: cmpGE(ascension, 1, 'infer', ''),
  }),
  customParam('c1_extraCardamom', extraCardamom, {
    cond: cmpGE(constellation, 1, 'infer', ''),
  }),
  customShield('c2_shield', undefined, c2Shield, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  }),
  customShield('c2_dendroShield', 'dendro', c2Shield, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  }),
  customDmg(
    'c4',
    info.ele,
    'burst',
    prod(final.atk, percent(dm.constellation4.dmg)),
    { cond: cmpGE(constellation, 4, 'infer', '') }
  ),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_duration', dm.skill.shieldDuration),
  customParam('skill_parcelDuration', dm.skill.parcelDuration),
  customParam('skill_cdMin', dm.skill.cdMin),
  customParam('skill_cdMax', dm.skill.cdMax),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.cost),
  customParam('c2_duration', dm.constellation2.duration, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  }),
  customParam('c2_cd', dm.constellation2.cd, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  }),
  customParam('c4_cd', dm.constellation4.cd, {
    cond: cmpGE(constellation, 4, 'infer', ''),
  })
)
