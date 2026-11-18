import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpNE, min, prod, sum } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  customDmg,
  customParam,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, splitScaleDmg } from './util'

const key: CharacterKey = 'Mitya'
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
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
    detonationDmg: skillParam_gen.auto[a + 3],
    detonationStellarDmg: skillParam_gen.auto[a + 4],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    tapDmg: skillParam_gen.skill[s++],
    holdDmg: skillParam_gen.skill[s++],
    steadyDmg: skillParam_gen.skill[s++],
    steadyConsumptionDmg: skillParam_gen.skill[s++],
    steadyDetonationDmg: skillParam_gen.skill[s++],
    duration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmgAtk: skillParam_gen.burst[b++],
    skillDmgEleMas: skillParam_gen.burst[b++],
    beaconsCreated: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    eleMas: skillParam_gen.passive1[0][0],
  },
  passive2: {
    critRate_: skillParam_gen.passive2[0][0],
    maxStacks: 4,
    duration: 15,
  },
  passive3: {
    base_stellarconduct_dmg_: skillParam_gen.passive3![0][0],
    maxBase_stellarconduct_dmg_: skillParam_gen.passive3![1][0],
  },
  constellation1: {
    critDMG_: skillParam_gen.constellation1[0],
    energyRegen: skillParam_gen.constellation1[1],
    cd: skillParam_gen.constellation1[2],
  },
  constellation2: {
    cryoElectro_enemyRes_: skillParam_gen.constellation2[0],
    steady_eleMas: skillParam_gen.constellation2[1],
    overloaded_eleMas: skillParam_gen.constellation2[2],
  },
  constellation4: {
    dmg: skillParam_gen.constellation4[0],
  },
  constellation6: {
    chance: skillParam_gen.constellation6[0],
    stellarconduct_specialDmg_: skillParam_gen.constellation6[1],
    steady_mult_: skillParam_gen.constellation6[2],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { ascension, constellation },
} = own
// WR cond(key, 'c1Core' | 'c2CoreField') `'on'`
const { c1Core, c2CoreField } = allBoolConditionals(info.key)
// WR cond(key, 'a0StellarRadianceSc') state `'sc'`
const { a0StellarRadianceSc } = allListConditionals(info.key, ['sc'])
// WR cond(key, 'c2CoreType') states `'steady'` | `'overloaded'`
const { c2CoreType } = allListConditionals(info.key, ['steady', 'overloaded'])
// WR lookup skillDetonation / a1Beacons 1..4, or 5 at C1. a4Stacks 1..4.
const { skillDetonation } = allNumConditionals(info.key, true, 0, 5)
const { a1Beacons } = allNumConditionals(info.key, true, 0, 5)
const { a4Stacks } = allNumConditionals(
  info.key,
  true,
  0,
  dm.passive2.maxStacks
)

const radianceSc = a0StellarRadianceSc.map({ sc: 1 })
// Unset lookup is 1; stacks >= 5 need C1 (WR greaterEq → 0).
const skillDetonationGated = cmpGE(
  skillDetonation,
  5,
  cmpGE(constellation, 1, skillDetonation, 0),
  skillDetonation
)
const skillDetonationMult = cmpGE(skillDetonation, 1, skillDetonationGated, 1)
const a1BeaconsGated = cmpGE(
  a1Beacons,
  5,
  cmpGE(constellation, 1, a1Beacons, 0),
  a1Beacons
)
const a0_stellarconduct_baseDmg_ = min(
  prod(percent(dm.passive3.base_stellarconduct_dmg_), final.eleMas),
  percent(dm.passive3.maxBase_stellarconduct_dmg_)
)
const a1BeaconsEleMas = cmpGE(
  ascension,
  1,
  prod(a1BeaconsGated, dm.passive1.eleMas)
)
const a4Stacks_critRate_ = cmpGE(
  ascension,
  4,
  prod(a4Stacks, percent(dm.passive2.critRate_))
)
const c1Core_critDMG_ = c1Core.ifOn(
  cmpGE(constellation, 1, percent(dm.constellation1.critDMG_))
)
const c2CoreField_enemyRes_ = c2CoreField.ifOn(
  cmpGE(
    constellation,
    2,
    prod(-1, percent(dm.constellation2.cryoElectro_enemyRes_))
  )
)
const c2Steady_eleMas = cmpGE(
  constellation,
  2,
  c2CoreType.map({ steady: dm.constellation2.steady_eleMas, overloaded: 0 })
)
const c2Overloaded_eleMas = cmpGE(
  constellation,
  2,
  c2CoreType.map({
    steady: 0,
    overloaded: dm.constellation2.overloaded_eleMas,
  })
)
const c6Steady_mult_ = sum(
  1,
  cmpGE(constellation, 6, percent(dm.constellation6.steady_mult_))
)
const c6_stellarconduct_specialDmg_ = cmpGE(
  constellation,
  6,
  percent(dm.constellation6.stellarconduct_specialDmg_)
)
const active = cmpNE(destIsActive, 0, 1)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // WR flags.radiance `'sc'`
  ownBuff.common.radianceSc.add(radianceSc),
  // C3 skill; C5 auto
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.auto.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.critRate_.add(a4Stacks_critRate_),
  // A0 — WR teamBuff stellarconduct_baseDmg_ (no Pando baseDmg_ tag; Sandrone)
  teamBuff.premod.dmg_.stellarconduct.add(a0_stellarconduct_baseDmg_),
  teamBuff.premod.eleMas.add(a1BeaconsEleMas),
  teamBuff.premod.eleMas.add(c2Steady_eleMas),
  // WR equal(activeCharKey, target.charKey)
  teamBuff.premod.critDMG_.add(prod(active, c1Core_critDMG_)),
  teamBuff.premod.eleMas.add(prod(active, c2Overloaded_eleMas)),
  // WR teamBuff.*_enemyRes_ (attacker tag); Pando enemy preRes.
  enemyDebuff.common.preRes.cryo.add(c2CoreField_enemyRes_),
  enemyDebuff.common.preRes.electro.add(c2CoreField_enemyRes_),
  // WR stellarconduct_specialDmg_ (no Pando specialDmg_ tag)
  teamBuff.premod.dmg_.stellarconduct.add(c6_stellarconduct_specialDmg_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  dmg(
    'charged_detonationDmg',
    info,
    'atk',
    dm.charged.detonationDmg,
    'charged'
  ),
  // WR stellarTalentDmgNode (stellarconduct / electro). Talent-style listing
  // until the trans pipeline exists (Sandrone).
  dmg(
    'charged_detonationStellarDmg',
    info,
    'eleMas',
    dm.charged.detonationStellarDmg,
    'charged',
    { ele: 'electro' }
  ),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_tapDmg', info, 'atk', dm.skill.tapDmg, 'skill'),
  dmg('skill_holdDmg', info, 'atk', dm.skill.holdDmg, 'skill'),
  dmg('skill_steadyDmg', info, 'atk', dm.skill.steadyDmg, 'skill', {
    baseMulti: c6Steady_mult_,
  }),
  dmg(
    'skill_steadyConsumptionDmg',
    info,
    'eleMas',
    dm.skill.steadyConsumptionDmg,
    'skill',
    { ele: 'electro', baseMulti: c6Steady_mult_ }
  ),
  dmg(
    'skill_steadyDetonationDmg',
    info,
    'eleMas',
    dm.skill.steadyDetonationDmg,
    'skill',
    {
      ele: 'electro',
      baseMulti: prod(skillDetonationMult, c6Steady_mult_),
    }
  ),
  splitScaleDmg(
    'burst_skillDmg',
    info,
    ['atk', 'eleMas'],
    [dm.burst.skillDmgAtk, dm.burst.skillDmgEleMas],
    'burst'
  ),
  customDmg(
    'c4',
    'electro',
    'elemental',
    prod(percent(dm.constellation4.dmg), final.eleMas),
    { cond: cmpGE(constellation, 4, 'infer', '') }
  ),

  customParam('a0_stellarconduct_baseDmg_', a0_stellarconduct_baseDmg_),
  customParam('skillDetonationMult_', skillDetonationMult),
  customParam('charged_stam', dm.charged.stam),
  customParam('skill_duration', dm.skill.duration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_beaconsCreated', dm.burst.beaconsCreated),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost),
  customParam('a4_duration', dm.passive2.duration, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam('c1_cd', dm.constellation1.cd, {
    cond: cmpGE(constellation, 1, 'infer', ''),
  })
)
