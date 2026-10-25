import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import {
  allListConditionals,
  allNumConditionals,
  customDmg,
  customParam,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'Keqing'
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
      skillParam_gen.auto[a++], // 4.1
      skillParam_gen.auto[a++], // 4.2
      skillParam_gen.auto[a++], // 5
    ],
  },
  charged: {
    dmg1: skillParam_gen.auto[a++], // 1
    dmg2: skillParam_gen.auto[a++], // 2
    stamina: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    stiletto: skillParam_gen.skill[s++],
    slash: skillParam_gen.skill[s++],
    thunderclap: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    initial: skillParam_gen.burst[b++],
    slash: skillParam_gen.burst[b++],
    final: skillParam_gen.burst[b++],
    cd: skillParam_gen.burst[b++][0],
    cost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    duration: skillParam_gen.passive1[0][0],
  },
  passive2: {
    critInc_: skillParam_gen.passive2[p2++][0],
    enerRechInc_: skillParam_gen.passive2[p2++][0],
    duration: skillParam_gen.passive2[p2++][0],
  },
  constellation1: {
    dmg: skillParam_gen.constellation1[0],
  },
  constellation4: {
    duration: skillParam_gen.constellation4[0],
    atkInc: skillParam_gen.constellation4[1],
  },
  constellation6: {
    electroInc: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
const { afterRecast } = allListConditionals(info.key, ['afterRecast'])
const { afterBurst } = allListConditionals(info.key, ['afterBurst'])
const { afterReact } = allListConditionals(info.key, ['afterReact'])
const { c6Stack } = allNumConditionals(info.key, true, 0, 4)

const recastOn = afterRecast.map({ afterRecast: 1 })
const burstOn = afterBurst.map({ afterBurst: 1 })
const reactOn = afterReact.map({ afterReact: 1 })
const infusionOn = cmpGE(prod(cmpGE(ascension, 1, 1), recastOn), 1, 'infer', '')
// WR copies the critRate node onto enerRech_ (`{ ...afterBurstCritRate_ }`).
const afterBurst_critRate_ = cmpGE(
  ascension,
  4,
  prod(burstOn, percent(dm.passive2.critInc_))
)
const afterBurst_enerRech_ = afterBurst_critRate_
const afterReact_atk_ = cmpGE(
  constellation,
  4,
  prod(reactOn, percent(dm.constellation4.atkInc))
)
const c6_electro_dmg_ = cmpGE(
  constellation,
  6,
  prod(c6Stack, percent(dm.constellation6.electroInc))
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Foreseen Reformation (burst); C5 Beckoning Stars (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.critRate_.add(afterBurst_critRate_),
  ownBuff.premod.enerRech_.add(afterBurst_enerRech_),
  ownBuff.premod.atk_.add(afterReact_atk_),
  ownBuff.premod.dmg_.electro.add(c6_electro_dmg_),

  dm.normal.hitArr.flatMap((arr, i) => [
    ...dmg(`normal_${i}`, info, 'atk', arr, 'normal'),
    ...dmg(`normal_${i}_electro`, info, 'atk', arr, 'normal', {
      ele: 'electro',
      cond: infusionOn,
    }),
  ]),
  dmg('charged_1', info, 'atk', dm.charged.dmg1, 'charged'),
  dmg('charged_2', info, 'atk', dm.charged.dmg2, 'charged'),
  dmg('charged_1_electro', info, 'atk', dm.charged.dmg1, 'charged', {
    ele: 'electro',
    cond: infusionOn,
  }),
  dmg('charged_2_electro', info, 'atk', dm.charged.dmg2, 'charged', {
    ele: 'electro',
    cond: infusionOn,
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) => [
    ...dmg(`plunging_${k}`, info, 'atk', v, 'plunging'),
    ...dmg(`plunging_${k}_electro`, info, 'atk', v, 'plunging', {
      ele: 'electro',
      cond: infusionOn,
    }),
  ]),
  dmg('skill_stiletto', info, 'atk', dm.skill.stiletto, 'skill'),
  dmg('skill_slash', info, 'atk', dm.skill.slash, 'skill'),
  dmg('skill_thunderclap', info, 'atk', dm.skill.thunderclap, 'skill'),
  dmg('burst_initial', info, 'atk', dm.burst.initial, 'burst'),
  dmg('burst_slash', info, 'atk', dm.burst.slash, 'burst'),
  dmg('burst_final', info, 'atk', dm.burst.final, 'burst'),
  customDmg(
    'c1',
    info.ele,
    'elemental',
    prod(percent(dm.constellation1.dmg), final.atk),
    { cond: cmpGE(constellation, 1, 'infer', '') }
  ),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.cost)
)
