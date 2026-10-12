import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpNE, min, prod } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, shield } from './util'

const key: CharacterKey = 'Dahlia'
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
      skillParam_gen.auto[a++], // 3.1
      skillParam_gen.auto[a++], // 3.2
      skillParam_gen.auto[a++], // 4
    ],
  },
  charged: {
    dmg1: skillParam_gen.auto[a++],
    dmg2: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    shieldFlat: skillParam_gen.burst[b++],
    shieldMult: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    // Encoding Energy Cost {{4}}=60, CD {{5}}=15s. WR named these cd/enerCost swapped.
    enerCost: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
  },
  passive1: {
    cd: skillParam_gen.passive1[0][0],
  },
  passive2: {
    atkSPD_: skillParam_gen.passive2[0][0],
    maxAtkSpd_: skillParam_gen.passive2[1][0],
  },
  constellation1: {
    energyRegen: skillParam_gen.constellation1[0],
  },
  constellation2: {
    shield_: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
  },
  constellation4: {
    durationInc: skillParam_gen.constellation4[0],
  },
  constellation6: {
    atkSPD_: skillParam_gen.constellation6[0],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
// WR cond(key, 'burstActive' | 'c2BurstConsumed')
const { burstActive, c2BurstConsumed } = allBoolConditionals(info.key)

// WR activeCharBuff: Favonian Favor ATK SPD on the on-fielder only.
// atkSPD_ does not feed HP, so own.final.hp matches WR input.total.hp.
const a4_atkSPD_ = burstActive.ifOn(
  cmpGE(
    ascension,
    4,
    cmpNE(
      destIsActive,
      0,
      min(
        prod(final.hp, percent(dm.passive2.atkSPD_)),
        percent(dm.passive2.maxAtkSpd_)
      )
    )
  )
)
const c6_atkSPD_ = burstActive.ifOn(
  cmpGE(
    constellation,
    6,
    cmpNE(destIsActive, 0, percent(dm.constellation6.atkSPD_))
  )
)
const c2_shield_ = c2BurstConsumed.ifOn(
  cmpGE(
    constellation,
    2,
    cmpNE(destIsActive, 0, percent(dm.constellation2.shield_))
  )
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Radiant Psalter (burst); C5 Immersive Ordinance (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  teamBuff.premod.atkSPD_.add(a4_atkSPD_),
  teamBuff.premod.atkSPD_.add(c6_atkSPD_),
  teamBuff.premod.shield_.add(c2_shield_),

  // Formulas
  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_dmg1', info, 'atk', dm.charged.dmg1, 'charged'),
  dmg('charged_dmg2', info, 'atk', dm.charged.dmg2, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.skillDmg, 'skill'),
  dmg('burst', info, 'atk', dm.burst.skillDmg, 'burst'),
  shield(
    'burst_shield',
    'hp',
    dm.burst.shieldMult,
    dm.burst.shieldFlat,
    'burst'
  ),
  shield(
    'burst_hydroShield',
    'hp',
    dm.burst.shieldMult,
    dm.burst.shieldFlat,
    'burst',
    { ele: 'hydro' }
  ),

  customParam('charged_stamina', dm.charged.stam),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost),
  customParam('c2_duration', dm.constellation2.duration, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  })
)
