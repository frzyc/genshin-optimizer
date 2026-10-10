import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, min, prod, sum } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  allListConditionals,
  customDmg,
  customHeal,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Dori'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++], // 1
      skillParam_gen.auto[a++], // 2.1
      skillParam_gen.auto[a++], // 2.2
      skillParam_gen.auto[a++], // 3
    ],
  },
  charged: {
    spinningDmg: skillParam_gen.auto[a++],
    finalDmg: skillParam_gen.auto[a++],
    stamina: skillParam_gen.auto[a++][0],
    duration: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    shotDmg: skillParam_gen.skill[s++],
    roundDmg: skillParam_gen.skill[s++],
    numRounds: 2,
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    connectorDmg: skillParam_gen.burst[b++],
    healMult: skillParam_gen.burst[b++],
    healBase: skillParam_gen.burst[b++],
    energyRegen: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    cdRed: skillParam_gen.passive1[0][0],
    cd: skillParam_gen.passive1[1][0],
  },
  passive2: {
    energyRegen: skillParam_gen.passive2[0][0],
    maxEnergyRegen: skillParam_gen.passive2[1][0],
  },
  constellation1: {
    addlRounds: 1,
  },
  constellation2: {
    toopDmg: skillParam_gen.constellation2[0],
  },
  constellation4: {
    hpThresh: 50,
    energyThresh: 50,
    incHeal_: skillParam_gen.constellation4[0],
    enerRech_: skillParam_gen.constellation4[1],
  },
  constellation6: {
    infusionDuration: skillParam_gen.constellation6[0],
    heal_: skillParam_gen.constellation6[1],
    cd: 0.1,
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { burst, ascension, constellation },
} = own
const { c6AfterSkill } = allBoolConditionals(info.key)
const { c4BelowHp } = allListConditionals(info.key, ['belowHp'])
const { c4BelowEner } = allListConditionals(info.key, ['belowEner'])

const c4BelowHp_incHeal_ = prod(
  cmpGE(
    constellation,
    4,
    percent(c4BelowHp.map({ belowHp: dm.constellation4.incHeal_ }))
  ),
  destIsActive
)
const c4BelowEner_enerRech_ = prod(
  cmpGE(
    constellation,
    4,
    percent(c4BelowEner.map({ belowEner: dm.constellation4.enerRech_ }))
  ),
  destIsActive
)
const c6InfusionOn = cmpGE(
  prod(cmpGE(constellation, 6, 1), c6AfterSkill.ifOn(1)),
  1,
  'infer',
  ''
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 Alcazarzaray's Exactitude (burst); C5 Super Stickler (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  teamBuff.premod.incHeal_.add(c4BelowHp_incHeal_),
  teamBuff.premod.enerRech_.add(c4BelowEner_enerRech_),

  // WR infusion.overridableSelf electro. infusionPrio has no electro channel —
  // listing-local `{ ele: 'electro' }` on C6 NA/CA/plunge.
  dm.normal.hitArr.flatMap((arr, i) => [
    ...dmg(`normal_${i}`, info, 'atk', arr, 'normal'),
    ...dmg(`normal_${i}_electro`, info, 'atk', arr, 'normal', {
      ele: 'electro',
      cond: c6InfusionOn,
    }),
  ]),
  dmg('charged_spin', info, 'atk', dm.charged.spinningDmg, 'charged'),
  dmg('charged_final', info, 'atk', dm.charged.finalDmg, 'charged'),
  dmg('charged_spin_electro', info, 'atk', dm.charged.spinningDmg, 'charged', {
    ele: 'electro',
    cond: c6InfusionOn,
  }),
  dmg('charged_final_electro', info, 'atk', dm.charged.finalDmg, 'charged', {
    ele: 'electro',
    cond: c6InfusionOn,
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) => [
    ...dmg(`plunging_${k}`, info, 'atk', v, 'plunging'),
    ...dmg(`plunging_${k}_electro`, info, 'atk', v, 'plunging', {
      ele: 'electro',
      cond: c6InfusionOn,
    }),
  ]),
  dmg('skill_shot', info, 'atk', dm.skill.shotDmg, 'skill'),
  dmg('skill_round', info, 'atk', dm.skill.roundDmg, 'skill'),
  dmg('burst_connector', info, 'atk', dm.burst.connectorDmg, 'burst'),
  customHeal(
    'burst_heal',
    sum(
      prod(percent(talentSubscript(burst, dm.burst.healMult)), final.hp),
      talentSubscript(burst, dm.burst.healBase)
    )
  ),
  customParam(
    'a4_energyRegen',
    min(
      prod(dm.passive2.energyRegen, own.final.enerRech_),
      dm.passive2.maxEnergyRegen
    ),
    { cond: cmpGE(ascension, 4, 'infer', '') }
  ),
  customDmg(
    'c2',
    info.ele,
    'elemental',
    prod(percent(dm.constellation2.toopDmg), final.atk),
    { cond: cmpGE(constellation, 2, 'infer', '') }
  ),
  customHeal('c6_heal', prod(percent(dm.constellation6.heal_), final.hp), {
    cond: c6InfusionOn,
  }),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('charged_duration', dm.charged.duration),
  customParam('skill_cd', dm.skill.cd),
  customParam(
    'burst_energyRegen',
    talentSubscript(burst, dm.burst.energyRegen)
  ),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
