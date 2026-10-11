import { absorbableEle, type CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpEq, cmpGE, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allNumConditionals,
  customDmg,
  customParam,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'ShikanoinHeizou'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0,
  p2 = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4.1
      skillParam_gen.auto[a++], // 4.2
      skillParam_gen.auto[a++], // 4.3
      skillParam_gen.auto[a++], // 5
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    declension_dmg_: skillParam_gen.skill[s++],
    conviction_dmg_: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
    declension_duration: skillParam_gen.skill[s++][0],
  },
  burst: {
    slugger_dmg: skillParam_gen.burst[b++],
    iris_dmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive2: {
    duration: skillParam_gen.passive2[p2++][0],
    eleMas: skillParam_gen.passive2[p2++][0],
  },
  passive3: {
    staminaSprintDec_: 0.25,
  },
  constellation1: {
    duration: skillParam_gen.constellation1[0],
    atkSpd_: skillParam_gen.constellation1[1],
    cd: skillParam_gen.constellation1[2],
  },
  constellation4: {
    baseEnergy: skillParam_gen.constellation4[0],
    addlEnergy: skillParam_gen.constellation4[1],
  },
  constellation6: {
    hsCritRate_: skillParam_gen.constellation6[0],
    hsCritDmg_: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, ascension, constellation },
} = own
const { skillHit, takeField } = allBoolConditionals(info.key)
const { declensionStacks } = allNumConditionals(info.key, true, 0, 4)

const skillMv = sum(
  percent(talentSubscript(skill, dm.skill.dmg)),
  prod(
    declensionStacks,
    percent(talentSubscript(skill, dm.skill.declension_dmg_))
  ),
  cmpEq(
    declensionStacks,
    4,
    percent(talentSubscript(skill, dm.skill.conviction_dmg_))
  )
)
const a4_eleMas = skillHit.ifOn(cmpGE(ascension, 4, dm.passive2.eleMas))
const c1_atkSPD_ = takeField.ifOn(
  cmpGE(constellation, 1, percent(dm.constellation1.atkSpd_))
)
const c6_skill_critRate_ = cmpGE(
  constellation,
  6,
  prod(declensionStacks, percent(dm.constellation6.hsCritRate_))
)
const c6_skill_critDMG_ = cmpGE(
  constellation,
  6,
  cmpEq(declensionStacks, 4, percent(dm.constellation6.hsCritDmg_))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Void Stare (skill); C5 Edict of Storms (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.atkSPD_.add(c1_atkSPD_),
  ownBuff.premod.critRate_.skill.add(c6_skill_critRate_),
  ownBuff.premod.critDMG_.skill.add(c6_skill_critDMG_),
  notOwnBuff.premod.eleMas.add(a4_eleMas),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  customDmg('skill', 'anemo', 'skill', prod(skillMv, final.atk)),
  dmg('burst_slugger', info, 'atk', dm.burst.slugger_dmg, 'burst'),
  absorbableEle.flatMap((ele) =>
    dmg(`burst_iris_${ele}`, info, 'atk', dm.burst.iris_dmg, 'burst', { ele })
  ),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost),
  customParam('p3_staminaSprintDec_', percent(dm.passive3.staminaSprintDec_))
)
