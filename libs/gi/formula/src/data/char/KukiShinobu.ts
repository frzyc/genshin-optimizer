import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod, sum } from '@genshin-optimizer/pando/engine'
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
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'KukiShinobu'
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
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4
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
    pressDmg: skillParam_gen.skill[s++],
    ringHealHP_: skillParam_gen.skill[s++],
    ringHealFlat: skillParam_gen.skill[s++],
    ringDmg: skillParam_gen.skill[s++],
    cost: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    singleDmg: skillParam_gen.burst[b++],
    maxDmgBase: skillParam_gen.burst[b++],
    maxDmgExtend: skillParam_gen.burst[b++],
    durationBase: skillParam_gen.burst[b++][0],
    durationExtend: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    hpThresh_: skillParam_gen.passive1[p1++][0],
    heal_: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    emSkillHeal_: skillParam_gen.passive2[p2++][0],
    emSkillDmg_: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    aoeInc: 0.5,
  },
  constellation2: {
    skillDurInc: skillParam_gen.constellation2[0],
  },
  constellation4: {
    markDmg: skillParam_gen.constellation4[0],
    cd: skillParam_gen.constellation4[1],
  },
  constellation6: {
    hpThresh_: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
    em: skillParam_gen.constellation6[2],
    cd: skillParam_gen.constellation6[3],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill: skillTalent, ascension, constellation },
} = own
// WR cond(key, 'underHP' | 'c6Trigger')
const { underHP, c6Trigger } = allBoolConditionals(info.key)

const a1Heal_ = underHP.ifOn(cmpGE(ascension, 1, percent(dm.passive1.heal_)))
const a4Skill_healInc = cmpGE(
  ascension,
  4,
  prod(percent(dm.passive2.emSkillHeal_), final.eleMas)
)
const a4Skill_dmgInc = cmpGE(
  ascension,
  4,
  prod(percent(dm.passive2.emSkillDmg_), final.eleMas)
)
const c6eleMas = c6Trigger.ifOn(cmpGE(constellation, 6, dm.constellation6.em))

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Sanctifying Ring (skill); C5 Gyoei Narukami Kariyama Rite (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.heal_.add(a1Heal_),
  ownBuff.premod.eleMas.add(c6eleMas),
  // WR skill_dmgInc → formula.base.skill (no flat dmgInc tag)
  ownBuff.formula.base.skill.add(a4Skill_dmgInc),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_dmg1', info, 'atk', dm.charged.dmg1, 'charged'),
  dmg('charged_dmg2', info, 'atk', dm.charged.dmg2, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('pressDmg', info, 'atk', dm.skill.pressDmg, 'skill'),
  // WR healNodeTalent overlay premod.healInc — no healInc tag; fold into base
  customHeal(
    'ringHeal',
    sum(
      prod(
        percent(talentSubscript(skillTalent, dm.skill.ringHealHP_)),
        final.hp
      ),
      talentSubscript(skillTalent, dm.skill.ringHealFlat),
      a4Skill_healInc
    )
  ),
  dmg('ringDmg', info, 'atk', dm.skill.ringDmg, 'skill'),
  dmg('singleDmg', info, 'hp', dm.burst.singleDmg, 'burst'),
  customParam('a4Skill_dmgInc', a4Skill_dmgInc, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam('a4Skill_healInc', a4Skill_healInc, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customDmg(
    'markDmg',
    info.ele,
    'skill',
    prod(percent(dm.constellation4.markDmg), final.hp),
    { cond: cmpGE(constellation, 4, 'infer', '') }
  ),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_cost', dm.skill.cost),
  customParam(
    'skill_duration',
    sum(
      dm.skill.duration,
      cmpGE(constellation, 2, dm.constellation2.skillDurInc)
    )
  ),
  customParam('skill_cd', dm.skill.cd),
  customParam(
    'burst_duration',
    underHP.ifOn(dm.burst.durationExtend, dm.burst.durationBase)
  ),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.cost),
  customParam('c4_cd', dm.constellation4.cd, {
    cond: cmpGE(constellation, 4, 'infer', ''),
  }),
  customParam('c6_duration', dm.constellation6.duration, {
    cond: cmpGE(constellation, 6, 'infer', ''),
  }),
  customParam('c6_cd', dm.constellation6.cd, {
    cond: cmpGE(constellation, 6, 'infer', ''),
  })
)
