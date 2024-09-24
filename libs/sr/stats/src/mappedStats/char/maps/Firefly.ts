import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'
import { scalingParams } from '../util'

const key: CharacterKey = 'Firefly'
const data_gen = allStats.char[key]
const {
  basic,
  skill,
  ult,
  talent,
  technique,
  eidolon,
  bonusAbility1,
  bonusAbility2,
  bonusAbility3,
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

export default dm
