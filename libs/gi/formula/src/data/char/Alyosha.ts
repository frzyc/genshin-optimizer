import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, cmpNE, min, prod } from '@genshin-optimizer/pando/engine'
import { destIsActive } from '../common/conds'
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
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Alyosha'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = -1,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[++a], // 1
      skillParam_gen.auto[++a], // 2
      skillParam_gen.auto[++a], // 3.1
      skillParam_gen.auto[++a], // 3.2
      skillParam_gen.auto[++a], // 4
    ],
  },
  charged: {
    dmg: skillParam_gen.auto[++a],
    stam: skillParam_gen.auto[++a][0],
  },
  plunging: {
    dmg: skillParam_gen.auto[++a],
    low: skillParam_gen.auto[++a],
    high: skillParam_gen.auto[++a],
  },
  skill: {
    pressDmg: skillParam_gen.skill[s++],
    holdDmg: skillParam_gen.skill[s++],
    cd: skillParam_gen.skill[s++][0],
    markDuration: skillParam_gen.skill[s++][0],
    precisionAtk_: skillParam_gen.skill[s++],
    precisionDuration: skillParam_gen.skill[s++][0],
  },
  burst: {
    fieldDmg: skillParam_gen.burst[b++],
    tugarinDmg: skillParam_gen.burst[b++],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    heal: skillParam_gen.passive1[0][0],
  },
  passive2: {
    skillBurst_dmg_: skillParam_gen.passive2[0][0],
    maxEnerRech_: skillParam_gen.passive2[1][0],
  },
  passive3: {
    stellarconduct_dmg_: skillParam_gen.passive3![0][0],
  },
  constellation1: {
    energyRegen: skillParam_gen.constellation1[0],
    cd: skillParam_gen.constellation1[1],
  },
  constellation2: {
    durationInc: skillParam_gen.constellation2[0],
  },
  constellation4: {
    heal: skillParam_gen.constellation4[0],
  },
  constellation6: {
    eleMas: skillParam_gen.constellation6[0],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { skill, ascension, constellation },
} = own
// WR cond(key, 'skillPrecision') states `'1'` / `'2'` (C6 unlocks 2)
const { skillPrecision } = allListConditionals(info.key, ['1', '2'])
// WR cond(key, 'a0StellarRadianceSc') `'on'`
const { a0StellarRadianceSc } = allBoolConditionals(info.key)

// Subscript `ex` must be primitives (C6 only unlocks the `'2'` UI state in WR).
const skillPrecisionStacks = skillPrecision.map({
  '1': 1,
  '2': 2,
})
const skillPrecision_atk_ = cmpNE(
  destIsActive,
  0,
  prod(
    skillPrecisionStacks,
    percent(talentSubscript(skill, dm.skill.precisionAtk_))
  )
)
const a0Precision_stellarconduct_dmg_ = a0StellarRadianceSc.ifOn(
  cmpNE(
    destIsActive,
    0,
    prod(skillPrecisionStacks, percent(dm.passive3.stellarconduct_dmg_))
  )
)
const a4_skill_burst_dmg_ = cmpGE(
  ascension,
  4,
  prod(
    percent(dm.passive2.skillBurst_dmg_),
    min(prod(final.enerRech_, 100), dm.passive2.maxEnerRech_)
  )
)
const c6Precision_eleMas = cmpNE(
  destIsActive,
  0,
  cmpGE(
    constellation,
    6,
    skillPrecision.map({
      '2': dm.constellation6.eleMas,
    })
  )
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  // C3 skill; C5 burst
  ownBuff.char.skill.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.burst.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.dmg_.skill.add(a4_skill_burst_dmg_),
  ownBuff.premod.dmg_.burst.add(a4_skill_burst_dmg_),
  // WR teamBuff dest-gated to active character
  teamBuff.premod.atk_.add(skillPrecision_atk_),
  teamBuff.premod.dmg_.stellarconduct.add(a0Precision_stellarconduct_dmg_),
  teamBuff.premod.eleMas.add(c6Precision_eleMas),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged', info, 'atk', dm.charged.dmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_press', info, 'atk', dm.skill.pressDmg, 'skill'),
  dmg('skill_hold', info, 'atk', dm.skill.holdDmg, 'skill'),
  dmg('burst_field', info, 'atk', dm.burst.fieldDmg, 'burst'),
  dmg('burst_tugarin', info, 'atk', dm.burst.tugarinDmg, 'burst'),
  customHeal('p1_heal', prod(percent(dm.passive1.heal), final.atk), {
    cond: cmpGE(ascension, 1, 'infer', ''),
  }),
  customHeal('c4_heal', prod(percent(dm.constellation4.heal), final.atk), {
    cond: cmpGE(constellation, 4, 'infer', ''),
  }),

  customParam('charged_stam', dm.charged.stam),
  customParam('skill_cd', dm.skill.cd),
  customParam('skill_markDuration', dm.skill.markDuration),
  customParam('skill_precisionDuration', dm.skill.precisionDuration),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
