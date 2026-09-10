import type { CharacterKey } from '@genshin-optimizer/gi/consts'
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

const key: CharacterKey = 'Amber'
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
    ],
  },
  charged: {
    aimed: skillParam_gen.auto[a++],
    aimedCharged: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    inheritedHp: skillParam_gen.skill[s++],
    dmg: skillParam_gen.skill[s++],
    unknown: skillParam_gen.skill[s++], // what is this??
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmgPerWave: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
    rainDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
  },
  passive1: {
    critRateInc: skillParam_gen.passive1[p1++][0],
    aoeInc: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    atkInc: skillParam_gen.passive2[p2++][0],
    duration: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    secArrowDmg: skillParam_gen.constellation1[0],
  },
  constellation2: {
    manualDetionationDmg: skillParam_gen.constellation2[0],
  },
  constellation6: {
    moveSpdInc: skillParam_gen.constellation6[0],
    atkInc: skillParam_gen.constellation6[1],
    duration: skillParam_gen.constellation6[2],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, ascension, constellation },
} = own
// WR cond(key, 'A4') / cond(key, 'C6')
const { A4, C6 } = allBoolConditionals(info.key)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Fiery Rain (burst); C5 Explosive Puppet (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.critRate_.burst.add(
    cmpGE(ascension, 1, percent(dm.passive1.critRateInc))
  ),
  ownBuff.premod.atk_.add(
    A4.ifOn(cmpGE(ascension, 4, percent(dm.passive2.atkInc)))
  ),
  teamBuff.premod.moveSPD_.add(
    C6.ifOn(cmpGE(constellation, 6, percent(dm.constellation6.moveSpdInc)))
  ),
  teamBuff.premod.atk_.add(
    C6.ifOn(cmpGE(constellation, 6, percent(dm.constellation6.atkInc)))
  ),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_aimed', info, 'atk', dm.charged.aimed, 'charged'),
  dmg('charged_aimedCharged', info, 'atk', dm.charged.aimedCharged, 'charged', {
    ele: 'pyro',
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.dmg, 'skill'),
  customParam(
    'skill_inheritedHp',
    prod(talentSubscript(skill, dm.skill.inheritedHp), final.hp)
  ),
  dmg('dmgPerWave', info, 'atk', dm.burst.dmgPerWave, 'burst'),
  dmg('rainDmg', info, 'atk', dm.burst.rainDmg, 'burst'),
  dmg('c1_secondAimed', info, 'atk', dm.charged.aimed, 'charged', {
    baseMulti: percent(dm.constellation1.secArrowDmg),
    cond: cmpGE(constellation, 1, 'infer', ''),
  }),
  dmg(
    'c1_secondAimedCharged',
    info,
    'atk',
    dm.charged.aimedCharged,
    'charged',
    {
      ele: 'pyro',
      baseMulti: percent(dm.constellation1.secArrowDmg),
      cond: cmpGE(constellation, 1, 'infer', ''),
    }
  ),
  dmg(
    'c2',
    info,
    'atk',
    dm.skill.dmg,
    'skill',
    { cond: cmpGE(constellation, 2, 'infer', '') },
    ownBuff.premod.dmg_.skill.add(
      percent(dm.constellation2.manualDetionationDmg)
    )
  ),

  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
