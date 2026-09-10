import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import {
  cmpGE,
  min,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allNumConditionals,
  customDmg,
  customHeal,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Xianyun'
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
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    trailDmg: skillParam_gen.skill[s++],
    firstLeapDmg: skillParam_gen.skill[s++],
    secondLeapDmg: skillParam_gen.skill[s++],
    thirdLeapDmg: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    instantDmg: skillParam_gen.burst[b++],
    coordinatedDmg: skillParam_gen.burst[b++],
    instantHealFlat: skillParam_gen.burst[b++],
    instantHealMult: skillParam_gen.burst[b++],
    deviceHealFlat: skillParam_gen.burst[b++],
    deviceHealMult: skillParam_gen.burst[b++],
    deviceHealInterval: skillParam_gen.burst[b++][0],
    dmgTriggers: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    critRate: [
      skillParam_gen.passive1[0][0],
      skillParam_gen.passive1[1][0],
      skillParam_gen.passive1[2][0],
      skillParam_gen.passive1[3][0],
    ],
    duration: skillParam_gen.passive1[4][0],
  },
  passive2: {
    plunging_dmg_inc: skillParam_gen.passive2[0][0],
    maxAtk: skillParam_gen.passive2[1][0],
    triggerInterval: skillParam_gen.passive2[2][0],
  },
  constellation2: {
    atk_: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
    plunging_dmg_inc_mult: skillParam_gen.constellation2[2],
  },
  constellation4: {
    heal1: skillParam_gen.constellation4[0],
    heal2: skillParam_gen.constellation4[1],
    heal3: skillParam_gen.constellation4[2],
    cd: skillParam_gen.constellation4[3],
  },
  constellation6: {
    skill_critDMG_: [
      skillParam_gen.constellation6[0],
      skillParam_gen.constellation6[1],
      skillParam_gen.constellation6[2],
    ],
    cd: skillParam_gen.constellation6[3],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, burst, ascension, constellation },
} = own
const { a4HasStacks, c2AfterSkill } = allBoolConditionals(info.key)
const { a1Stacks } = allNumConditionals(info.key, true, 0, 4)
const { c6SkyladderUses } = allNumConditionals(info.key, true, 0, 3)

const a1_plunging_critRate_ = cmpGE(
  ascension,
  1,
  cmpGE(
    a1Stacks,
    1,
    percent(subscript(sum(a1Stacks, -1), dm.passive1.critRate))
  )
)
const a4IncRatio = cmpGE(
  constellation,
  2,
  (1 + dm.constellation2.plunging_dmg_inc_mult) * dm.passive2.plunging_dmg_inc,
  dm.passive2.plunging_dmg_inc
)
const a4HasStacks_plunging_dmg_inc = a4HasStacks.ifOn(
  cmpGE(
    ascension,
    4,
    prod(percent(a4IncRatio), min(own.final.atk, dm.passive2.maxAtk))
  )
)
const c2AfterSkill_atk_ = c2AfterSkill.ifOn(
  cmpGE(constellation, 2, dm.constellation2.atk_)
)
const c6Wave_critDMG_ = cmpGE(
  constellation,
  6,
  cmpGE(
    c6SkyladderUses,
    1,
    percent(
      subscript(sum(c6SkyladderUses, -1), dm.constellation6.skill_critDMG_)
    )
  )
)

function leap(name: string, table: number[]) {
  return customDmg(
    name,
    'anemo',
    'plunging',
    prod(percent(talentSubscript(skill, table)), final.atk),
    undefined,
    ownBuff.premod.critDMG_.plunging.add(c6Wave_critDMG_),
    ownBuff.formula.base.add(a4HasStacks_plunging_dmg_inc)
  )
}

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Starwicker (burst); C5 Skyladder (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.atk_.add(c2AfterSkill_atk_),
  // WR teamBuff.premod.plunging_critRate_
  teamBuff.premod.critRate_.plunging.add(a1_plunging_critRate_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  dmg('plunging_dmg', info, 'atk', dm.plunging.dmg, 'plunging'),
  dmg(
    'plunging_low',
    info,
    'atk',
    dm.plunging.low,
    'plunging',
    undefined,
    ownBuff.formula.base.add(a4HasStacks_plunging_dmg_inc)
  ),
  dmg(
    'plunging_high',
    info,
    'atk',
    dm.plunging.high,
    'plunging',
    undefined,
    ownBuff.formula.base.add(a4HasStacks_plunging_dmg_inc)
  ),
  dmg('skill_trail', info, 'atk', dm.skill.trailDmg, 'skill'),
  leap('skill_leap1', dm.skill.firstLeapDmg),
  leap('skill_leap2', dm.skill.secondLeapDmg),
  leap('skill_leap3', dm.skill.thirdLeapDmg),
  dmg('burst', info, 'atk', dm.burst.instantDmg, 'burst'),
  dmg('burst_coord', info, 'atk', dm.burst.coordinatedDmg, 'burst'),
  customHeal(
    'burst_instantHeal',
    sum(
      prod(
        percent(talentSubscript(burst, dm.burst.instantHealMult)),
        final.atk
      ),
      talentSubscript(burst, dm.burst.instantHealFlat)
    )
  ),
  customHeal(
    'burst_deviceHeal',
    sum(
      prod(percent(talentSubscript(burst, dm.burst.deviceHealMult)), final.atk),
      talentSubscript(burst, dm.burst.deviceHealFlat)
    )
  ),
  customHeal('c4_heal1', prod(percent(dm.constellation4.heal1), final.atk), {
    cond: cmpGE(constellation, 4, 'infer', ''),
  }),
  customHeal('c4_heal2', prod(percent(dm.constellation4.heal2), final.atk), {
    cond: cmpGE(constellation, 4, 'infer', ''),
  }),
  customHeal('c4_heal3', prod(percent(dm.constellation4.heal3), final.atk), {
    cond: cmpGE(constellation, 4, 'infer', ''),
  }),

  customParam('charged_stam', dm.charged.stam),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
