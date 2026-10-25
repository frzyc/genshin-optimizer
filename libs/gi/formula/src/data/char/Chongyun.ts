import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, lookup, prod } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  allListConditionals,
  customDmg,
  customParam,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Chongyun'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let s = 0,
  b = 0,
  p1 = 0,
  p2 = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[0], // 1
      skillParam_gen.auto[1], // 2
      skillParam_gen.auto[2], // 3
      skillParam_gen.auto[3], // 4
    ],
  },
  charged: {
    spin_dmg: skillParam_gen.auto[4],
    final_dmg: skillParam_gen.auto[5],
    stamina: skillParam_gen.auto[6][0],
    duration: skillParam_gen.auto[7][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[8],
    low: skillParam_gen.auto[9],
    high: skillParam_gen.auto[10],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    infusionDuration: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
    fieldDuration: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    atk_spd: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    dmg: skillParam_gen.passive2[p2++][0],
    res: skillParam_gen.passive2[p2++][0],
    duration: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    dmg: skillParam_gen.constellation1[0],
  },
  constellation2: {
    cdr: skillParam_gen.constellation2[0],
  },
  constellation4: {
    energy_regen: skillParam_gen.constellation4[0],
    cd: skillParam_gen.constellation4[1],
  },
  constellation6: {
    burst_dmg_: skillParam_gen.constellation6[0],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, ascension, constellation },
} = own
const { c6 } = allBoolConditionals(info.key)
const { skill: skillField } = allListConditionals(info.key, ['activeInArea'])
const { asc4 } = allListConditionals(info.key, ['hit'])

const inArea = skillField.map({ activeInArea: 1 })
const inAreaActive = prod(inArea, destIsActive)
const correctWep = lookup(
  own.common.weaponType,
  { sword: 1, claymore: 1, polearm: 1 },
  0
)
const infusionOn = cmpGE(prod(inAreaActive, correctWep), 1, 'infer', '')
const a1_atkSPD_ = prod(
  inAreaActive,
  cmpGE(ascension, 1, percent(dm.passive1.atk_spd))
)
const a4_cryo_enemyRes_ = cmpGE(ascension, 4, asc4.map({ hit: -0.1 }))
const c6_burst_dmg_ = c6.ifOn(
  cmpGE(constellation, 6, percent(dm.constellation6.burst_dmg_))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Cloud-Parting Star (burst); C5 True Secret of Shuanghua (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.dmg_.burst.add(c6_burst_dmg_),
  teamBuff.premod.atkSPD_.add(a1_atkSPD_),
  // WR teamBuff.premod.cryo_enemyRes_ (attacker tag); Pando enemy preRes. Keep WR sign.
  enemyDebuff.common.preRes.cryo.add(a4_cryo_enemyRes_),

  dm.normal.hitArr.flatMap((arr, i) => [
    ...dmg(`normal_${i}`, info, 'atk', arr, 'normal'),
    ...dmg(`normal_${i}_cryo`, info, 'atk', arr, 'normal', {
      ele: 'cryo',
      cond: infusionOn,
    }),
  ]),
  dmg('charged_spin', info, 'atk', dm.charged.spin_dmg, 'charged'),
  dmg('charged_final', info, 'atk', dm.charged.final_dmg, 'charged'),
  dmg('charged_spin_cryo', info, 'atk', dm.charged.spin_dmg, 'charged', {
    ele: 'cryo',
    cond: infusionOn,
  }),
  dmg('charged_final_cryo', info, 'atk', dm.charged.final_dmg, 'charged', {
    ele: 'cryo',
    cond: infusionOn,
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) => [
    ...dmg(`plunging_${k}`, info, 'atk', v, 'plunging'),
    ...dmg(`plunging_${k}_cryo`, info, 'atk', v, 'plunging', {
      ele: 'cryo',
      cond: infusionOn,
    }),
  ]),
  dmg('skill', info, 'atk', dm.skill.dmg, 'skill'),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst'),
  dmg('a4', info, 'atk', dm.skill.dmg, 'skill', {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customDmg(
    'c1',
    info.ele,
    'elemental',
    prod(percent(dm.constellation1.dmg), final.atk),
    { cond: cmpGE(constellation, 1, 'infer', '') }
  ),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('charged_duration', dm.charged.duration),
  customParam(
    'skill_infusionDuration',
    talentSubscript(skill, dm.skill.infusionDuration)
  ),
  customParam('skill_cd', dm.skill.cd),
  customParam('skill_fieldDuration', dm.skill.fieldDuration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
