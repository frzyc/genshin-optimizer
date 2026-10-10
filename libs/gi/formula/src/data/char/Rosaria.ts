import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, min, prod } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  enemyDebuff,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'Rosaria'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0,
  p1 = 0,
  p2 = 0,
  c1i = 0,
  c6i = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2
      skillParam_gen.auto[a++], // 3x2
      skillParam_gen.auto[a++], // 4
      skillParam_gen.auto[a++], // 5.1
      skillParam_gen.auto[a++], // 5.2
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
    hit1: skillParam_gen.skill[s++],
    hit2: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    hit1: skillParam_gen.burst[b++],
    hit2: skillParam_gen.burst[b++],
    dotDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    crInc: skillParam_gen.passive1[p1++][0],
    duration: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    crBonus: skillParam_gen.passive2[p2++][0],
    duration: skillParam_gen.passive2[p2++][0],
    maxBonus: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    atkSpdInc: skillParam_gen.constellation1[c1i++],
    dmgInc: skillParam_gen.constellation1[c1i++],
    duration: skillParam_gen.constellation1[c1i++],
  },
  constellation6: {
    physShred: skillParam_gen.constellation6[c6i++],
    duration: skillParam_gen.constellation6[c6i++],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  char: { ascension, constellation },
} = own
// WR cond(key, 'RosariaA1' | 'RosariaA4' | 'RosariaC1' | 'DilucC6')
const { RosariaA1, RosariaA4, RosariaC1, DilucC6 } = allBoolConditionals(
  info.key
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Ravaging Confession (skill); C5 Rites of Termination (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.critRate_.add(
    RosariaA1.ifOn(cmpGE(ascension, 1, percent(dm.passive1.crInc)))
  ),
  // Read own.premod (src) so the notOwn write does not cycle.
  notOwnBuff.premod.critRate_.add(
    RosariaA4.ifOn(
      cmpGE(
        ascension,
        4,
        min(
          prod(percent(dm.passive2.crBonus), own.premod.critRate_),
          percent(dm.passive2.maxBonus)
        )
      )
    )
  ),
  ownBuff.premod.atkSPD_.add(
    RosariaC1.ifOn(
      cmpGE(constellation, 1, percent(dm.constellation1.atkSpdInc))
    )
  ),
  ownBuff.premod.dmg_.normal.add(
    RosariaC1.ifOn(cmpGE(constellation, 1, percent(dm.constellation1.dmgInc)))
  ),
  enemyDebuff.common.preRes.physical.add(
    DilucC6.ifOn(cmpGE(constellation, 6, percent(-dm.constellation6.physShred)))
  ),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_hit1', info, 'atk', dm.skill.hit1, 'skill'),
  dmg('skill_hit2', info, 'atk', dm.skill.hit2, 'skill'),
  dmg('burst_hit1', info, 'atk', dm.burst.hit1, 'burst'),
  dmg('burst_hit2', info, 'atk', dm.burst.hit2, 'burst'),
  dmg('burst_dotDmg', info, 'atk', dm.burst.dotDmg, 'burst')
)
