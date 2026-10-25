import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allNumConditionals,
  customDmg,
  customParam,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'Kinich'
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
      skillParam_gen.auto[a++], // mid-air
    ],
  },
  charged: {
    stam: skillParam_gen.auto[a++][0],
    dmg: skillParam_gen.auto[a++], // x4
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    shotDmg: skillParam_gen.skill[s++],
    cannonDmg: skillParam_gen.skill[s++],
    pointLimit: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    laserDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    pointGain: skillParam_gen.passive1[0][0],
    cd: skillParam_gen.passive1[1][0],
  },
  passive2: {
    duration: skillParam_gen.passive2[0][0],
    dmgPerStack: skillParam_gen.passive2[1][0],
  },
  constellation1: {
    moveSPD_: skillParam_gen.constellation1[0],
    duration: skillParam_gen.constellation1[1],
    cannon_critDMG_: skillParam_gen.constellation1[2],
  },
  constellation2: {
    dendro_enemyRes_: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
    cannon_dmg_: skillParam_gen.constellation2[2],
  },
  constellation4: {
    energyRegen: skillParam_gen.constellation4[0],
    cd: skillParam_gen.constellation4[1],
    burst_dmg_: skillParam_gen.constellation4[2],
  },
  constellation6: {
    dmg: skillParam_gen.constellation6[0],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
// WR cond(key, 'a4Stacks') 1–2
const { a4Stacks } = allNumConditionals(info.key, true, 0, 2)
// WR cond(key, 'c2Hit' | 'c2FirstHit') `'on'`
const { c2Hit, c2FirstHit } = allBoolConditionals(info.key)

const a4Stacks_cannon_dmgInc = cmpGE(
  ascension,
  4,
  prod(a4Stacks, percent(dm.passive2.dmgPerStack), final.atk)
)
const c1Cannon_critDMG_ = cmpGE(
  constellation,
  1,
  percent(dm.constellation1.cannon_critDMG_)
)
const c2Hit_dendro_enemyRes_ = c2Hit.ifOn(
  cmpGE(constellation, 2, -dm.constellation2.dendro_enemyRes_)
)
const c2FirstHit_cannon_dmg_ = c2FirstHit.ifOn(
  cmpGE(constellation, 2, percent(dm.constellation2.cannon_dmg_))
)
const c4_burst_dmg_ = cmpGE(
  constellation,
  4,
  percent(dm.constellation4.burst_dmg_)
)
const cannonExtras = [
  ownBuff.formula.base.add(a4Stacks_cannon_dmgInc),
  ownBuff.premod.critDMG_.skill.add(c1Cannon_critDMG_),
  ownBuff.premod.dmg_.skill.add(c2FirstHit_cannon_dmg_),
] as const

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 skill; C5 burst
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.dmg_.burst.add(c4_burst_dmg_),
  ownBuff.premod.moveSPD_.add(
    cmpGE(constellation, 1, percent(dm.constellation1.moveSPD_))
  ),
  // WR teamBuff.premod.dendro_enemyRes_ (negative shred)
  enemyDebuff.common.preRes.dendro.add(c2Hit_dendro_enemyRes_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_shot', info, 'atk', dm.skill.shotDmg, 'skill'),
  dmg(
    'skill_cannon',
    info,
    'atk',
    dm.skill.cannonDmg,
    'skill',
    undefined,
    ...cannonExtras
  ),
  dmg('burst', info, 'atk', dm.burst.skillDmg, 'burst'),
  dmg('burst_laser', info, 'atk', dm.burst.laserDmg, 'burst'),
  customDmg(
    'c6',
    'dendro',
    'skill',
    prod(percent(dm.constellation6.dmg), final.atk),
    { cond: cmpGE(constellation, 6, 'infer', '') },
    ...cannonExtras
  ),

  customParam('charged_stam', dm.charged.stam),
  customParam('skill_pointLimit', dm.skill.pointLimit),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
