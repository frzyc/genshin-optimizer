import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpNE, prod } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  customParam,
  own,
  ownBuff,
  percent,
  register,
  teamBuff,
} from '../util'
import {
  dataGenToCharInfo,
  dmg,
  entriesForChar,
  shield,
  talentSubscript,
} from './util'

const key: CharacterKey = 'Valeriy'
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
    mortarDmg: skillParam_gen.auto[a++],
    stam: skillParam_gen.auto[a++][0],
    electro_dmgInc: skillParam_gen.auto[a++],
    stellarconduct_dmgInc: skillParam_gen.auto[a++],
    directiveStacks: skillParam_gen.auto[a++][0],
    directiveDuration: skillParam_gen.auto[a++][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[a++],
    low: skillParam_gen.auto[a++],
    high: skillParam_gen.auto[a++],
  },
  skill: {
    skillDmg: skillParam_gen.skill[s++],
    shieldAtk_: skillParam_gen.skill[s++],
    shieldFlat: skillParam_gen.skill[s++],
    shieldDuration: skillParam_gen.skill[s++][0],
    cd: skillParam_gen.skill[s++][0],
  },
  burst: {
    skillDmg: skillParam_gen.burst[b++],
    shellDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    momentumGain: skillParam_gen.passive1[0][0],
    maxMomentumGain: skillParam_gen.passive1[1][0],
  },
  passive2: {
    nonRadiance_dmg_: skillParam_gen.passive2[0][0],
    radiance_dmg_: skillParam_gen.passive2[1][0],
    maxMomentum: 100,
  },
  constellation1: {
    energyRegen: skillParam_gen.constellation1[0],
    maxEnergyRegen: skillParam_gen.constellation1[1],
    addlMomentumGain_: skillParam_gen.constellation1[2],
  },
  constellation2: {
    addlShield: skillParam_gen.constellation2[0],
    eleMas: skillParam_gen.constellation2[1],
    maxExcessMomentum: skillParam_gen.constellation2[2],
    duration: skillParam_gen.constellation2[3],
  },
  constellation4: {
    chargingEff_: skillParam_gen.constellation4[0],
    momentumLimitInc: 30,
    maxMomentum: 104,
  },
  constellation6: {
    dmg_: skillParam_gen.constellation6[0],
    duration: skillParam_gen.constellation6[1],
    electro_critRate_: skillParam_gen.constellation6[2],
    electro_stellarconduct_critDMG_: skillParam_gen.constellation6[3],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  char: { auto, ascension, constellation },
} = own
// WR cond(key, 'chargedOffensive' | 'c2Skill' | 'c6Hit') `'on'`
const { chargedOffensive, c2Skill, c6Hit } = allBoolConditionals(info.key)
// WR cond(key, 'a0StellarRadianceSc') state `'sc'`
const { a0StellarRadianceSc } = allListConditionals(info.key, ['sc'])
// WR lookup a4Momentum 5..100 step 5, or ..130 at C4
const { a4Momentum } = allNumConditionals(
  info.key,
  true,
  0,
  dm.passive2.maxMomentum + dm.constellation4.momentumLimitInc
)

const radianceSc = a0StellarRadianceSc.map({ sc: 1 })
const notSc = cmpGE(radianceSc, 1, 0, 1)
// Values above 100 exist only at C4 (WR lookup).
const momentum = cmpGE(
  a4Momentum,
  dm.passive2.maxMomentum + 1,
  cmpGE(constellation, 4, a4Momentum, 0),
  a4Momentum
)
// WR reads premod.atk. sheet:agg avoids a formula.base cycle (Yun Jin).
const premodAtk = own.premod.atk.sheet('agg')
const chargedOn = chargedOffensive.ifOn(1)

const charged_electro_dmgInc = prod(
  chargedOn,
  notSc,
  percent(talentSubscript(auto, dm.charged.electro_dmgInc)),
  premodAtk
)
const charged_stellarconduct_dmgInc = prod(
  chargedOn,
  radianceSc,
  percent(talentSubscript(auto, dm.charged.stellarconduct_dmgInc)),
  premodAtk
)
const a4_electro_dmgInc = cmpGE(
  ascension,
  4,
  prod(
    chargedOn,
    notSc,
    percent(dm.passive2.nonRadiance_dmg_),
    premodAtk,
    momentum
  )
)
const a4_stellarconduct_dmgInc = cmpGE(
  ascension,
  4,
  prod(
    chargedOn,
    radianceSc,
    percent(dm.passive2.radiance_dmg_),
    premodAtk,
    momentum
  )
)
const active = cmpNE(destIsActive, 0, 1)
const c2Skill_eleMas = c2Skill.ifOn(
  cmpGE(constellation, 2, dm.constellation2.eleMas)
)
const c6_shell_dmg_ = cmpGE(constellation, 6, percent(dm.constellation6.dmg_))
const c6Hit_electro_critRate_ = c6Hit.ifOn(
  cmpGE(constellation, 6, percent(dm.constellation6.electro_critRate_))
)
const c6Hit_stellarconduct_electro_critDMG_ = c6Hit.ifOn(
  cmpGE(
    constellation,
    6,
    percent(dm.constellation6.electro_stellarconduct_critDMG_)
  )
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // WR flags.radiance `'sc'`
  ownBuff.common.radianceSc.add(radianceSc),
  // C3 auto; C5 skill
  ownBuff.char.auto.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  // WR equal(activeCharKey, target.charKey) on the teamBuff dmgInc / crit
  teamBuff.formula.base.electro.add(prod(active, charged_electro_dmgInc)),
  teamBuff.formula.base.stellarconduct.add(
    prod(active, charged_stellarconduct_dmgInc)
  ),
  teamBuff.formula.base.electro.add(prod(active, a4_electro_dmgInc)),
  teamBuff.formula.base.stellarconduct.add(
    prod(active, a4_stellarconduct_dmgInc)
  ),
  teamBuff.premod.eleMas.add(c2Skill_eleMas),
  teamBuff.premod.critRate_.electro.add(prod(active, c6Hit_electro_critRate_)),
  teamBuff.premod.critDMG_.stellarconduct.electro.add(
    prod(active, c6Hit_stellarconduct_electro_critDMG_)
  ),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  dmg('charged_mortarDmg', info, 'atk', dm.charged.mortarDmg, 'charged', {
    ele: 'electro',
  }),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill', info, 'atk', dm.skill.skillDmg, 'skill'),
  shield(
    'skill_shield',
    'atk',
    dm.skill.shieldAtk_,
    dm.skill.shieldFlat,
    'skill'
  ),
  shield(
    'skill_shield_electro',
    'atk',
    dm.skill.shieldAtk_,
    dm.skill.shieldFlat,
    'skill',
    { ele: 'electro' }
  ),
  dmg('burst_skillDmg', info, 'atk', dm.burst.skillDmg, 'burst'),
  dmg(
    'burst_shellDmg',
    info,
    'atk',
    dm.burst.shellDmg,
    'burst',
    {},
    ownBuff.premod.dmg_.burst.add(c6_shell_dmg_)
  ),

  customParam('charged_electro_dmgInc', charged_electro_dmgInc),
  customParam('charged_stellarconduct_dmgInc', charged_stellarconduct_dmgInc),
  customParam('a4Momentum_electro_dmgInc', a4_electro_dmgInc, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam('a4Momentum_stellarconduct_dmgInc', a4_stellarconduct_dmgInc, {
    cond: cmpGE(ascension, 4, 'infer', ''),
  }),
  customParam('charged_stam', dm.charged.stam),
  customParam('charged_directiveStacks', dm.charged.directiveStacks),
  customParam('charged_directiveDuration', dm.charged.directiveDuration),
  customParam('skill_shieldDuration', dm.skill.shieldDuration),
  customParam('skill_cd', dm.skill.cd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost),
  customParam('c2_duration', dm.constellation2.duration, {
    cond: cmpGE(constellation, 2, 'infer', ''),
  }),
  customParam('c6_duration', dm.constellation6.duration, {
    cond: cmpGE(constellation, 6, 'infer', ''),
  })
)
