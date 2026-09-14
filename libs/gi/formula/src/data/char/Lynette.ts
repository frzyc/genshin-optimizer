import { absorbableEle, type CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpNE, prod, subscript } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allListConditionals,
  customHeal,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar } from './util'

const key: CharacterKey = 'Lynette'
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
    thrustDmg: skillParam_gen.skill[s++],
    thrustDmgAgain: skillParam_gen.skill[s++],
    bladeDmg: skillParam_gen.skill[s++],
    hpRegen: skillParam_gen.skill[s++][0],
    hpCost: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
    bladeInterval: skillParam_gen.skill[s++][0],
    holdMaxDuration: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    boxDmg: skillParam_gen.burst[b++],
    shotDmg: skillParam_gen.burst[b++],
    boxDuration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    duration: skillParam_gen.passive1[0][0],
    atk_: [
      0,
      skillParam_gen.passive1[1][0],
      skillParam_gen.passive1[2][0],
      skillParam_gen.passive1[3][0],
      skillParam_gen.passive1[4][0],
    ],
  },
  passive2: {
    burst_dmg_: skillParam_gen.passive2[0][0],
  },
  constellation6: {
    anemo_dmg_: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
const { a1AfterBurst, c6AfterThrust } = allBoolConditionals(info.key)
const { burstAbsorb } = allListConditionals(info.key, [...absorbableEle])

const a1AfterBurst_atk_ = a1AfterBurst.ifOn(
  cmpGE(ascension, 1, percent(subscript(own.common.eleCount, dm.passive1.atk_)))
)
const a4BurstAbsorb_burst_dmg_ = cmpGE(
  ascension,
  4,
  cmpNE(burstAbsorb.value, 0, percent(dm.passive2.burst_dmg_))
)
const c6AfterThrust_anemo_dmg_ = c6AfterThrust.ifOn(
  cmpGE(constellation, 6, percent(dm.constellation6.anemo_dmg_))
)
const c6InfusionOn = cmpGE(
  prod(cmpGE(constellation, 6, 1), c6AfterThrust.ifOn(1)),
  1,
  'infer',
  ''
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Cognition-Revising Magic (burst); C5 Obscuring Mirage (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  // WR A1 teamBuff is whole-party — not dest-gated.
  teamBuff.premod.atk_.add(a1AfterBurst_atk_),
  ownBuff.premod.dmg_.burst.add(a4BurstAbsorb_burst_dmg_),
  ownBuff.premod.dmg_.anemo.add(c6AfterThrust_anemo_dmg_),

  // WR infusion.overridableSelf anemo. infusionPrio has no anemo channel —
  // listing-local `{ ele: 'anemo' }` on C6 NA/CA/plunge.
  dm.normal.hitArr.flatMap((arr, i) => [
    ...dmg(`normal_${i}`, info, 'atk', arr, 'normal'),
    ...dmg(`normal_${i}_anemo`, info, 'atk', arr, 'normal', {
      ele: 'anemo',
      cond: c6InfusionOn,
    }),
  ]),
  dmg('charged_1', info, 'atk', dm.charged.dmg1, 'charged'),
  dmg('charged_2', info, 'atk', dm.charged.dmg2, 'charged'),
  dmg('charged_1_anemo', info, 'atk', dm.charged.dmg1, 'charged', {
    ele: 'anemo',
    cond: c6InfusionOn,
  }),
  dmg('charged_2_anemo', info, 'atk', dm.charged.dmg2, 'charged', {
    ele: 'anemo',
    cond: c6InfusionOn,
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) => [
    ...dmg(`plunging_${k}`, info, 'atk', v, 'plunging'),
    ...dmg(`plunging_${k}_anemo`, info, 'atk', v, 'plunging', {
      ele: 'anemo',
      cond: c6InfusionOn,
    }),
  ]),
  dmg('skill_thrust', info, 'atk', dm.skill.thrustDmg, 'skill'),
  dmg('skill_blade', info, 'atk', dm.skill.bladeDmg, 'skill'),
  customHeal('skill_hpRegen', prod(percent(dm.skill.hpRegen), final.hp)),
  customParam('skill_hpCost', prod(percent(dm.skill.hpCost), final.hp)),
  dmg('burst', info, 'atk', dm.burst.skillDmg, 'burst'),
  dmg('burst_box', info, 'atk', dm.burst.boxDmg, 'burst'),
  absorbableEle.flatMap((ele) =>
    dmg(`burst_shot_${ele}`, info, 'atk', dm.burst.shotDmg, 'burst', { ele })
  ),

  customParam('charged_stam', dm.charged.stam),
  customParam('skill_cd', dm.skill.cd),
  customParam('skill_bladeInterval', dm.skill.bladeInterval),
  customParam('skill_holdMaxDuration', dm.skill.holdMaxDuration),
  customParam('burst_boxDuration', dm.burst.boxDuration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
