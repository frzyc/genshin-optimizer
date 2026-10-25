import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allElementKeys } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Ningguang'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0,
  p1 = 0
const dm = {
  normal: {
    hitArr: [skillParam_gen.auto[a++]],
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    jadeDmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    screenHpMod: skillParam_gen.skill[s++], // 100% + skillParam_gen.skill[s++] * 100
    skillDmg: skillParam_gen.skill[s++],
    screenHp: skillParam_gen.skill[s++], // screenHp * 100%
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmgPerGem: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive2: {
    geoDmgBonus_: skillParam_gen.passive2[p1++][0],
    duration: skillParam_gen.passive2[p1++][0],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, ascension, constellation },
} = own
// WR cond(key, 'Ascension4' | 'Constellation4')
const { Ascension4, Constellation4 } = allBoolConditionals(info.key)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Starshatter (burst); C5 Jade Screen (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  teamBuff.premod.dmg_.geo.add(
    Ascension4.ifOn(cmpGE(ascension, 4, percent(dm.passive2.geoDmgBonus_)))
  ),
  allElementKeys.map((ele) =>
    teamBuff.premod.res_[ele].add(
      Constellation4.ifOn(cmpGE(constellation, 4, percent(0.1)))
    )
  ),

  // Formulas — catalyst geo: NA/CA/plunge inherit geo
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  dmg('charged_jade', info, 'atk', dm.charged.jadeDmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.skillDmg, 'skill'),
  customParam(
    'skill_screenHp',
    prod(talentSubscript(skill, dm.skill.screenHp), final.hp)
  ),
  dmg('burst', info, 'atk', dm.burst.dmgPerGem, 'burst')
)
