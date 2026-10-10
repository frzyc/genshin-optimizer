import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  customDmg,
  customParam,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Eula'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0,
  p1 = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3
      skillParam_gen.auto[a++], // 4
      skillParam_gen.auto[a++], // 5
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
    press: skillParam_gen.skill[s++],
    hold: skillParam_gen.skill[s++],
    icewhirl: skillParam_gen.skill[s++],
    physResDec: skillParam_gen.skill[s++],
    cryoResDec: skillParam_gen.skill[s++],
    resDecDuration: skillParam_gen.skill[s++][0],
    pressCd: skillParam_gen.skill[s++][0],
    holdCd: skillParam_gen.skill[s++][0],
    defBonus: skillParam_gen.skill[s++][0],
    unknown: skillParam_gen.skill[s++][0], // combined cooldown?
    physResDecNegative: skillParam_gen.skill[s++],
    cryoResDecNegative: skillParam_gen.skill[s++],
    grimheartDuration: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    lightfallDmg: skillParam_gen.burst[b++],
    dmgPerStack: skillParam_gen.burst[b++],
    maxStack: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    percentage: skillParam_gen.passive1[p1++][0],
  },
  constellation1: {
    physInc: skillParam_gen.constellation1[0],
  },
  constellation4: {
    dmgInc: skillParam_gen.constellation4[0],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, burst, ascension, constellation },
} = own
const { grimheartConsumed, LightfallSwordC4, TidalIllusion } =
  allBoolConditionals(info.key)
const { Grimheart } = allListConditionals(info.key, ['stack1', 'stack2'])
const { LightfallSword } = allNumConditionals(info.key, true, 0, 30)

const def_ = percent(
  Grimheart.map({
    stack1: dm.skill.defBonus,
    stack2: 2 * dm.skill.defBonus,
  })
)
const cryo_enemyRes_ = grimheartConsumed.ifOn(
  talentSubscript(skill, dm.skill.cryoResDecNegative)
)
const physical_enemyRes_ = grimheartConsumed.ifOn(
  talentSubscript(skill, dm.skill.physResDecNegative)
)
const physical_dmg_ = TidalIllusion.ifOn(
  cmpGE(constellation, 1, percent(dm.constellation1.physInc))
)
const c4_sword_dmg_ = LightfallSwordC4.ifOn(
  cmpGE(constellation, 4, dm.constellation4.dmgInc)
)
const lightfallBase = prod(
  sum(
    percent(talentSubscript(burst, dm.burst.lightfallDmg)),
    prod(percent(talentSubscript(burst, dm.burst.dmgPerStack)), LightfallSword)
  ),
  final.atk
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Glacial Illumination (burst); C5 Icetide Vortex (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.def_.add(def_),
  ownBuff.premod.dmg_.physical.add(physical_dmg_),
  // WR own premod cryo/physical_enemyRes_ (already-negative tables).
  enemyDebuff.common.preRes.cryo.add(cryo_enemyRes_),
  enemyDebuff.common.preRes.physical.add(physical_enemyRes_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_spin', info, 'atk', dm.charged.spinningDmg, 'charged'),
  dmg('charged_final', info, 'atk', dm.charged.finalDmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_press', info, 'atk', dm.skill.press, 'skill'),
  dmg('skill_hold', info, 'atk', dm.skill.hold, 'skill'),
  dmg('skill_icewhirl', info, 'atk', dm.skill.icewhirl, 'skill'),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst'),
  customDmg(
    'burst_lightfall',
    'physical',
    'burst',
    lightfallBase,
    undefined,
    ownBuff.premod.dmg_.burst.add(c4_sword_dmg_)
  ),
  customDmg(
    'a1_shattered',
    'physical',
    'burst',
    prod(
      percent(talentSubscript(burst, dm.burst.lightfallDmg)),
      percent(dm.passive1.percentage),
      final.atk
    ),
    { cond: cmpGE(ascension, 1, 'infer', '') },
    ownBuff.premod.dmg_.burst.add(c4_sword_dmg_)
  ),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('charged_duration', dm.charged.duration),
  customParam('skill_pressCd', dm.skill.pressCd),
  customParam('skill_holdCd', dm.skill.holdCd),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
