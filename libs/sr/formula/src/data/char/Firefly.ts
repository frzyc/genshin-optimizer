import { min, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '@genshin-optimizer/sr/stats'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  customDmg,
  customHeal,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
  teamBuff,
} from '../util'
import {
  dmg,
  entriesForChar,
  getBaseTag,
  isBonusAbilityActive,
  scalingParams,
} from './util'

const key: CharacterKey = 'Firefly'
const data_gen = allStats.char[key]
const baseTag = getBaseTag(data_gen)
const {
  basic,
  skill,
  ult,
  talent,
  technique,
  bonusAbility1,
  bonusAbility2,
  bonusAbility3,
  eidolon,
} = scalingParams(data_gen)

let s0 = 0,
  s1 = 0,
  u = 0,
  ta = 0,
  te = 0
const dm = {
  basic0: {
    dmg: basic[0][0],
  },
  basic1: {
    dmg: basic[1][0],
    heal: basic[1][1][0],
  },
  skill0: {
    dmg: skill[0][s0++],
    hpCost: skill[0][s0++][0],
    energyRegen: skill[0][s0++],
    actionAdvance: skill[0][s0++][0],
  },
  skill1: {
    dmg: skill[1][s1++],
    dmgBlast: skill[1][s1++],
    hpRestore: skill[1][s1++][0],
    debuffDuration: skill[1][s1++][0],
    dmgBase: skill[1][s1++][0],
    dmgBlastBase: skill[1][s1++][0],
    maxbrEffect_: skill[1][s1++][0],
  },
  ult: {
    break_dmg_: ult[0][u++],
    brEffiency_: ult[0][u++][0],
    spd: ult[0][u++],
    timerSpd: ult[0][u++][0],
  },
  talent: {
    dmgReduction: talent[0][ta++],
    energyStart: talent[0][ta++][0],
    hpThresh: talent[0][ta++][0],
    eff_res_: talent[0][ta++],
  },
  technique: {
    duration: technique[te++],
    debuffDuration: technique[te++],
    dmg: technique[te++],
  },
  ba1: {
    toughnessReduction: bonusAbility1[0],
  },
  ba2: {
    breakThreshold1: bonusAbility2[0],
    breakThreshhold2: bonusAbility2[1],
    superBreakDmg1: bonusAbility2[2],
    superBreakDmg2: bonusAbility2[3],
  },
  ba3: {
    atkThreshold: bonusAbility3[0],
    perAtk: bonusAbility3[1],
    break_: bonusAbility3[2],
  },
  e1: {
    defIgnore_: eidolon[1][0],
  },
  e2: {
    extraTurns: eidolon[2][0],
    cd: eidolon[2][1],
  },
  e4: {
    effect_res_: eidolon[4][0],
  },
  e6: {
    fire_resPen_: eidolon[6][0],
    break_efficiency_: eidolon[6][1],
  },
} as const

const { char } = own

// TODO: Add conditionals
const { ultInCompleteCombustion, techFireWeakness } = allBoolConditionals(key)
const { listConditional } = allListConditionals(key, ['val1', 'val2'])
const { numConditional } = allNumConditionals(key, true, 0, 2)

function skillDmg(name: string, baseMult: number, addlMult: number[]) {
  // (baseMult * capped break effect + addlMult)
  const multi = sum(
    prod(baseMult, min(own.final.brEffect_, percent(dm.skill1.maxbrEffect_))),
    percent(subscript(char.skill, addlMult))
  )
  const base = prod(own.final.atk, multi)
  return customDmg(name, baseTag, base)
}

const ba3_brEffect_ = isBonusAbilityActive(
  3,
  prod(sum(own.final.atk, -100), 1 / dm.ba3.perAtk, percent(dm.ba3.break_))
)

const sheet = register(
  key,
  // Handles base stats, StatBoosts and Eidolon 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...dmg('basic0Dmg', baseTag, 'atk', dm.basic0.dmg, 'basic'),
  ...customHeal('basic1Heal', prod(own.final.hp, percent(dm.basic1.heal))),
  ...dmg('basic1Dmg', baseTag, 'atk', dm.basic1.dmg, 'basic'),
  ...dmg('skill0Dmg', baseTag, 'atk', dm.skill0.dmg, 'skill'),
  ...skillDmg('skill1Dmg', dm.skill1.dmgBase, dm.skill1.dmg),
  ...skillDmg('skill1DmgBlast', dm.skill1.dmgBlastBase, dm.skill1.dmgBlast),
  ...customDmg(
    'techDmg',
    baseTag,
    prod(own.final.atk, percent(dm.technique.dmg))
  ),
  // TODO: ba2 superbreak; needs toughness reduction calculations
  ...registerBuff('ba3_brEffect_', ownBuff.premod.brEffect_.add(ba3_brEffect_)),

  // Buffs
  ownBuff.premod.spd.add(
    ultInCompleteCombustion.ifOn(subscript(char.ult, dm.ult.spd))
  ),
  ...ownBuff.premod.dmg_.break.map((read) =>
    read.add(
      ultInCompleteCombustion.ifOn(
        percent(subscript(char.ult, dm.ult.break_dmg_))
      )
    )
  ),
  ownBuff.premod.brEfficiency_.add(
    ultInCompleteCombustion.ifOn(percent(dm.ult.brEffiency_))
  ),
  // TODO: Properly add a way to set enemy weakness. This will be incorrect for enemies who already have fire weakness
  enemyDebuff.common.res.fire.add(techFireWeakness.ifOn(percent(-0.1))),
  ownBuff.premod.eff_res_.add(
    ultInCompleteCombustion.ifOn(
      percent(subscript(char.talent, dm.talent.eff_res_))
    )
  ),
  teamBuff.premod.dmg_.add(listConditional.map({ val1: 1, val2: 2 })),
  enemyDebuff.common.defIgn_.add(numConditional)
)
export default sheet
