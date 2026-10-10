import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  allNumConditionals,
  customParam,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Ganyu'
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
      skillParam_gen.auto[a++], // 5
      skillParam_gen.auto[a++], // 6
    ],
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    aimedCharged: skillParam_gen.auto[a++],
    frostflake: skillParam_gen.auto[a++],
    frostflakeBloom: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    inheritedHp: skillParam_gen.skill[s++],
    dmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    duration: skillParam_gen.passive1[p1++][0],
    critRateInc: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    cryoDmgBonus: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    opCryoRes: skillParam_gen.constellation1[0],
    duration: skillParam_gen.constellation1[1],
    enerRegen: skillParam_gen.constellation1[2],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, ascension, constellation },
} = own
const { A1, A4, C1 } = allBoolConditionals(info.key)
const { C4 } = allNumConditionals(info.key, true, 0, 5)

const a1_frostflake_critRate_ = A1.ifOn(
  cmpGE(ascension, 1, percent(dm.passive1.critRateInc))
)
const a4_cryo_dmg_ = prod(
  destIsActive,
  A4.ifOn(cmpGE(ascension, 4, percent(dm.passive2.cryoDmgBonus)))
)
const c1_cryo_enemyRes_ = C1.ifOn(
  cmpGE(constellation, 1, percent(dm.constellation1.opCryoRes))
)
const c4_all_dmg_ = cmpGE(constellation, 4, prod(C4, percent(0.05)))

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Cloud-Striding (burst); C5 The Merciful (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  teamBuff.premod.dmg_.cryo.add(a4_cryo_dmg_),
  teamBuff.premod.dmg_.add(c4_all_dmg_),
  // WR teamBuff.premod.cryo_enemyRes_; Pando enemy preRes. Keep WR sign.
  enemyDebuff.common.preRes.cryo.add(c1_cryo_enemyRes_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_aimed', info, 'atk', dm.charged.aimed, 'charged', {
    ele: 'physical',
  }),
  dmg('charged_aimedCharged', info, 'atk', dm.charged.aimedCharged, 'charged', {
    ele: 'cryo',
  }),
  dmg(
    'charged_frostflake',
    info,
    'atk',
    dm.charged.frostflake,
    'charged',
    {
      ele: 'cryo',
    },
    ownBuff.premod.critRate_.add(a1_frostflake_critRate_)
  ),
  dmg(
    'charged_frostflakeBloom',
    info,
    'atk',
    dm.charged.frostflakeBloom,
    'charged',
    { ele: 'cryo' },
    ownBuff.premod.critRate_.add(a1_frostflake_critRate_)
  ),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  customParam(
    'skill_inheritedHp',
    prod(talentSubscript(skill, dm.skill.inheritedHp), final.hp)
  ),
  dmg('skill', info, 'atk', dm.skill.dmg, 'skill'),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst'),

  customParam('skill_duration', dm.skill.duration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
