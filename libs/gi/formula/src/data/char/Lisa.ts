import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  customDmg,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'Lisa'
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
      skillParam_gen.auto[a++], // 4
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
    stack0: skillParam_gen.skill[s++],
    stack1: skillParam_gen.skill[s++],
    stack2: skillParam_gen.skill[s++],
    stack3: skillParam_gen.skill[s++],
    holdCD: skillParam_gen.skill[s++][0],
    press: skillParam_gen.skill[s++],
    pressCD: skillParam_gen.skill[s++][0],
  },
  burst: {
    summon: 0.1, //not in skillParam
    tick: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    unknown: skillParam_gen.passive1[0][0], // I have no idea what this is
  },
  passive2: {
    defShred: skillParam_gen.passive2[p2++][0],
    duration: skillParam_gen.passive2[p2++][0],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
// WR cond(key, 'LisaA4' | 'LisaC2')
const { LisaA4, LisaC2 } = allBoolConditionals(info.key)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Lightning Rose (burst); C5 Violet Arc (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  // WR greaterEq(asc, 1, …) — A4 talent, but sheet gates at ascension 1
  enemyDebuff.common.defRed_.add(
    LisaA4.ifOn(cmpGE(ascension, 1, percent(dm.passive2.defShred)))
  ),
  ownBuff.premod.def_.add(LisaC2.ifOn(cmpGE(constellation, 2, percent(0.25)))),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_press', info, 'atk', dm.skill.press, 'skill'),
  (['stack0', 'stack1', 'stack2', 'stack3'] as const).flatMap((k) =>
    dmg(`skill_${k}`, info, 'atk', dm.skill[k], 'skill')
  ),
  customDmg(
    'burst_summon',
    info.ele,
    'burst',
    prod(percent(dm.burst.summon), final.atk)
  ),
  dmg('burst_tick', info, 'atk', dm.burst.tick, 'burst')
)
