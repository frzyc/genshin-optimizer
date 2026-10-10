import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  customDmg,
  customParam,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'Collei'
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
    aimed: skillParam_gen.auto[a++],
    aimedCharged: skillParam_gen.auto[a++],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    dmg: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    explosionDmg: skillParam_gen.burst[b++],
    leapDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    unknown: skillParam_gen.passive1[p1++][0],
    sproutDmg: skillParam_gen.passive1[p1++][0],
    duration: skillParam_gen.passive1[p1++][0],
  },
  passive2: {
    durationInc: skillParam_gen.passive2[p2++][0],
    maxExtension: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    enerRech_: skillParam_gen.constellation1[0],
  },
  constellation2: {
    duration: skillParam_gen.constellation2[0],
    sproutDmg: skillParam_gen.constellation2[1],
    durationInc: skillParam_gen.constellation2[2],
  },
  constellation4: {
    eleMas: skillParam_gen.constellation4[0],
    duration: skillParam_gen.constellation4[1],
  },
  constellation6: {
    anbarDmg: skillParam_gen.constellation6[0],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
// WR cond(key, 'afterBurst') / cond(key, 'offField')
const { afterBurst, offField } = allBoolConditionals(info.key)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Floral Brush (skill); C5 Trump-Card Kitty (burst)
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  // C1 Deepwood Patrol — off-field ER (WR fraction 0.2; Pando still uses percent())
  ownBuff.premod.enerRech_.add(
    offField.ifOn(cmpGE(constellation, 1, percent(dm.constellation1.enerRech_)))
  ),
  // C4 Gift of the Woods — teammates only (WR unequal(target.charKey, key))
  notOwnBuff.premod.eleMas.add(
    afterBurst.ifOn(cmpGE(constellation, 4, dm.constellation4.eleMas))
  ),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_aimed', info, 'atk', dm.charged.aimed, 'charged', {
    ele: 'physical',
  }),
  dmg('charged_aimedCharged', info, 'atk', dm.charged.aimedCharged, 'charged', {
    ele: 'dendro',
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.dmg, 'skill'),
  dmg('burst_explosion', info, 'atk', dm.burst.explosionDmg, 'burst'),
  dmg('burst_leap', info, 'atk', dm.burst.leapDmg, 'burst'),
  customDmg(
    'a1_sprout',
    'dendro',
    'skill',
    prod(percent(dm.passive1.sproutDmg), final.atk),
    { cond: cmpGE(ascension, 1, 'infer', '') }
  ),
  customDmg(
    'c6',
    'dendro',
    'elemental',
    prod(percent(dm.constellation6.anbarDmg), final.atk),
    { cond: cmpGE(constellation, 6, 'infer', '') }
  ),

  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost),
  customParam('a1_duration', dm.passive1.duration, {
    cond: cmpGE(ascension, 1, 'infer', ''),
  })
)
