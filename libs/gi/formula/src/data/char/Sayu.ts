import { absorbableEle, type CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, min, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allListConditionals,
  allNumConditionals,
  customHeal,
  customParam,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Sayu'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[0], // 1
      skillParam_gen.auto[1], // 2
      skillParam_gen.auto[2], // 3x2
      skillParam_gen.auto[4], // 4
    ],
  },
  charged: {
    spin: skillParam_gen.auto[5],
    final: skillParam_gen.auto[6],
    stamina: skillParam_gen.auto[7][0],
    duration: skillParam_gen.auto[8][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[9],
    low: skillParam_gen.auto[10],
    high: skillParam_gen.auto[11],
  },
  skill: {
    wheelDmg: skillParam_gen.skill[s++],
    eleWheelDmg: skillParam_gen.skill[s++],
    kickPressDmg: skillParam_gen.skill[s++],
    kickHoldDmg: skillParam_gen.skill[s++],
    eleKickDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cdMin: skillParam_gen.skill[s++][0],
    cdMax: skillParam_gen.skill[s++][0],
  },
  burst: {
    pressDmg: skillParam_gen.burst[b++],
    pressBaseHeal: skillParam_gen.burst[b++],
    pressAtkHeal: skillParam_gen.burst[b++],
    darumaDmg: skillParam_gen.burst[b++],
    darumaBaseHeal: skillParam_gen.burst[b++],
    darumaAtkHeal: skillParam_gen.burst[b++],
    darumaHits: 7,
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    baseHeal: skillParam_gen.passive1[0][0],
    emHeal: skillParam_gen.passive1[1][0],
    cd: skillParam_gen.passive1[2][0],
  },
  passive2: {
    nearHeal: skillParam_gen.passive2[0][0],
  },
  constellation2: {
    dmgInc: skillParam_gen.constellation2[0],
    maxStacks: skillParam_gen.constellation2[1],
  },
  constellation4: {
    ener: skillParam_gen.constellation4[0],
    cd: skillParam_gen.constellation4[1],
  },
  constellation6: {
    darumaDmgInc: skillParam_gen.constellation6[0],
    maxStacks:
      skillParam_gen.constellation6[1] / skillParam_gen.constellation6[0],
    darumaHealInc: skillParam_gen.constellation6[2],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { burst, ascension, constellation },
} = own
const { skillAbsorption } = allListConditionals(info.key, [...absorbableEle])
const { c2SkillStack } = allNumConditionals(info.key, true, 0, 20)

const c2_kickPressDmg_ = cmpGE(
  constellation,
  2,
  percent(dm.constellation2.dmgInc)
)
const c2_kickDmg_ = cmpGE(
  constellation,
  2,
  prod(c2SkillStack, percent(dm.constellation2.dmgInc))
)
const c6EmCap = min(final.eleMas, dm.constellation6.maxStacks)
const c6_daruma_dmg_inc = cmpGE(
  constellation,
  6,
  prod(c6EmCap, dm.constellation6.darumaDmgInc, own.premod.atk.sheet('agg'))
)
const c6_daruma_heal_inc = cmpGE(
  constellation,
  6,
  prod(c6EmCap, dm.constellation6.darumaHealInc)
)
const darumaHeal = sum(
  prod(percent(talentSubscript(burst, dm.burst.darumaAtkHeal)), final.atk),
  talentSubscript(burst, dm.burst.darumaBaseHeal),
  c6_daruma_heal_inc
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Mujina Flurry (burst); C5 Gyakkochi: Whirling Hex (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_spin', info, 'atk', dm.charged.spin, 'charged'),
  dmg('charged_final', info, 'atk', dm.charged.final, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('wheelDmg', info, 'atk', dm.skill.wheelDmg, 'skill'),
  dmg(
    'kickPressDmg',
    info,
    'atk',
    dm.skill.kickPressDmg,
    'skill',
    undefined,
    ownBuff.premod.dmg_.skill.add(c2_kickPressDmg_)
  ),
  dmg(
    'kickHoldDmg',
    info,
    'atk',
    dm.skill.kickHoldDmg,
    'skill',
    undefined,
    ownBuff.premod.dmg_.skill.add(c2_kickDmg_)
  ),
  absorbableEle.flatMap((ele) =>
    dmg(`eleWheelDmg_${ele}`, info, 'atk', dm.skill.eleWheelDmg, 'skill', {
      ele,
    })
  ),
  absorbableEle.flatMap((ele) =>
    dmg(
      `eleKickDmg_${ele}`,
      info,
      'atk',
      dm.skill.eleKickDmg,
      'skill',
      { ele },
      ownBuff.premod.dmg_.skill.add(c2_kickDmg_)
    )
  ),
  dmg('pressDmg', info, 'atk', dm.burst.pressDmg, 'burst'),
  customHeal(
    'pressHeal',
    sum(
      prod(percent(talentSubscript(burst, dm.burst.pressAtkHeal)), final.atk),
      talentSubscript(burst, dm.burst.pressBaseHeal)
    )
  ),
  dmg(
    'darumaDmg',
    info,
    'atk',
    dm.burst.darumaDmg,
    'burst',
    undefined,
    ownBuff.formula.base.add(c6_daruma_dmg_inc)
  ),
  customHeal('darumaHeal', darumaHeal),
  customHeal(
    'a1Heal',
    sum(dm.passive1.baseHeal, prod(dm.passive1.emHeal, final.eleMas)),
    { cond: cmpGE(ascension, 1, 'infer', '') }
  ),
  customHeal('a4ExtraHeal', prod(darumaHeal, percent(dm.passive2.nearHeal)), {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),

  customParam('skillAbsorption', skillAbsorption.value),
  customParam('charged_stamina', dm.charged.stamina),
  customParam('charged_duration', dm.charged.duration),
  customParam('skill_duration', dm.skill.duration),
  customParam('skill_cdMin', dm.skill.cdMin),
  customParam('skill_cdMax', dm.skill.cdMax),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
