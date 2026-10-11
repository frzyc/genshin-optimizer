import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allStats } from '@genshin-optimizer/gi/stats'
import { cmpGE, prod, sum } from '@genshin-optimizer/pando/engine'
import {
  allBoolConditionals,
  allNumConditionals,
  customDmg,
  customParam,
  enemyDebuff,
  hexereiTally,
  own,
  ownBuff,
  percent,
  register,
  team,
} from '../util'
import { dataGenToCharInfo, dmg, entriesForChar, talentSubscript } from './util'

const key: CharacterKey = 'Razor'
const data_gen = allStats.char.data[key]
const skillParam_gen = allStats.char.skillParam[key]

let a = 0,
  s = 0,
  b = 0
const dm = {
  normal: {
    hitArr: [
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
      skillParam_gen.auto[a++],
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
    press: skillParam_gen.skill[s++],
    hold: skillParam_gen.skill[s++],
    erBonus: skillParam_gen.skill[s++][0],
    enerRegen: skillParam_gen.skill[s++][0],
    duration: skillParam_gen.skill[s++][0],
    pressCd: skillParam_gen.skill[s++][0],
    holdCd: skillParam_gen.skill[s++][0],
  },
  burst: {
    dmg: skillParam_gen.burst[b++],
    companionDmg: skillParam_gen.burst[b++],
    atkSpdBonus: skillParam_gen.burst[b++],
    electroResBonus: skillParam_gen.burst[b++][0],
    duration: skillParam_gen.burst[b++][0],
    cd: skillParam_gen.burst[b++][0],
    enerCost: skillParam_gen.burst[b++][0],
  },
  passive1: {
    cdRed: 0.18,
  },
  passive2: {
    enerThreshold: 0.5,
    erInc: 0.3,
  },
  passive3: {
    sprintStaminaDec: 0.2,
  },
  lockedPassive: {
    burst_dmgInc: skillParam_gen.lockedPassive![0][0],
    dmg: skillParam_gen.lockedPassive![1][0],
    energyRegen: skillParam_gen.lockedPassive![2][0],
    cd: skillParam_gen.lockedPassive![3][0],
  },
  constellation1: {
    allDmgInc: 0.1,
    duration: 8,
  },
  constellation2: {
    hpThreshold: 0.3,
    critRateInc: 0.1,
  },
  constellation4: {
    defDec: 0.15,
    duration: 7,
  },
  constellation6: {
    dmg: 1,
    electroSigilGenerated: 1,
    cd: 10,
    critRate_: skillParam_gen.constellation6[0],
    critDMG_: skillParam_gen.constellation6[1],
    duration: skillParam_gen.constellation6[2],
  },
} as const

const info = dataGenToCharInfo(data_gen)
const {
  final,
  char: { auto, burst, ascension, constellation },
} = own
// WR cond(key, 'lockHomework' | 'TheWolfWithin' | 'A4' | 'C1' | 'C2' | 'C4' | 'lockC6Sigil')
const { lockHomework, TheWolfWithin, A4, C1, C2, C4, lockC6Sigil } =
  allBoolConditionals(info.key)
const { ElectroSigil } = allNumConditionals(info.key, true, 0, 3)

const enerRechElectroSigil_ = prod(ElectroSigil, percent(dm.skill.erBonus))
const electro_res_ = TheWolfWithin.ifOn(percent(dm.burst.electroResBonus))
const atkSPD_ = TheWolfWithin.ifOn(
  percent(talentSubscript(burst, dm.burst.atkSpdBonus))
)
const enerRechA4_ = A4.ifOn(cmpGE(ascension, 4, percent(dm.passive2.erInc)))
const all_dmg_ = C1.ifOn(
  cmpGE(constellation, 1, percent(dm.constellation1.allDmgInc))
)
const critRate_ = C2.ifOn(
  cmpGE(constellation, 2, percent(dm.constellation2.critRateInc))
)
const enemyDefRed_ = C4.ifOn(
  cmpGE(constellation, 4, percent(dm.constellation4.defDec))
)
const lock_burst_dmgInc = lockHomework.ifOn(
  prod(percent(dm.lockedPassive.burst_dmgInc), own.premod.atk.sheet('agg'))
)
const hex2 = cmpGE(team.common.hexerei, 2, 1)
const lockC6Sigil_critRate_ = lockC6Sigil.ifOn(
  lockHomework.ifOn(
    cmpGE(constellation, 6, percent(dm.constellation6.critRate_))
  )
)
const lockC6Sigil_critDMG_ = lockC6Sigil.ifOn(
  lockHomework.ifOn(
    cmpGE(constellation, 6, percent(dm.constellation6.critDMG_))
  )
)

export default register(
  info.key,
  entriesForChar(info, data_gen),
  hexereiTally(lockHomework.ifOn(1)),
  // C3 Lightning Fang (burst); C5 Claw and Thunder (skill)
  ownBuff.char.burst.add(cmpGE(constellation, 3, 3)),
  ownBuff.char.skill.add(cmpGE(constellation, 5, 3)),

  ownBuff.premod.enerRech_.add(sum(enerRechElectroSigil_, enerRechA4_)),
  ownBuff.premod.res_.electro.add(electro_res_),
  ownBuff.premod.atkSPD_.add(atkSPD_),
  ownBuff.premod.dmg_.add(all_dmg_),
  ownBuff.premod.critRate_.add(sum(critRate_, lockC6Sigil_critRate_)),
  ownBuff.premod.critDMG_.add(lockC6Sigil_critDMG_),
  enemyDebuff.common.defRed_.add(enemyDefRed_),

  dm.normal.hitArr.flatMap((arr, i) =>
    dmg(`normal_${i}`, info, 'atk', arr, 'normal')
  ),
  dmg('charged_spin', info, 'atk', dm.charged.spinningDmg, 'charged'),
  dmg('charged_final', info, 'atk', dm.charged.finalDmg, 'charged'),
  Object.entries(dm.plunging).flatMap(([k, v]) =>
    dmg(`plunging_${k}`, info, 'atk', v, 'plunging')
  ),
  dmg('skill_press', info, 'atk', dm.skill.press, 'skill'),
  dmg('skill_hold', info, 'atk', dm.skill.hold, 'skill'),
  dmg('burst', info, 'atk', dm.burst.dmg, 'burst'),
  dm.normal.hitArr.flatMap((arr, i) =>
    customDmg(
      `companionDmg${i + 1}`,
      info.ele,
      'burst',
      prod(
        percent(talentSubscript(auto, arr)),
        percent(talentSubscript(burst, dm.burst.companionDmg)),
        final.atk
      ),
      undefined,
      ownBuff.formula.base.add(lock_burst_dmgInc)
    )
  ),
  customDmg(
    'lock_dmg',
    info.ele,
    'elemental',
    prod(percent(dm.lockedPassive.dmg), final.atk),
    { cond: cmpGE(prod(hex2, lockHomework.ifOn(1)), 1, 'infer', '') }
  ),
  customDmg(
    'c6',
    info.ele,
    'elemental',
    prod(percent(dm.constellation6.dmg), final.atk),
    { cond: cmpGE(constellation, 6, 'infer', '') }
  ),

  customParam('charged_stamina', dm.charged.stamina),
  customParam('charged_duration', dm.charged.duration),
  customParam('skill_enerRegen', dm.skill.enerRegen),
  customParam('skill_duration', dm.skill.duration),
  customParam('skill_pressCd', dm.skill.pressCd),
  customParam('skill_holdCd', dm.skill.holdCd),
  customParam('burst_duration', dm.burst.duration),
  customParam('burst_cd', dm.burst.cd),
  customParam('burst_enerCost', dm.burst.enerCost)
)
