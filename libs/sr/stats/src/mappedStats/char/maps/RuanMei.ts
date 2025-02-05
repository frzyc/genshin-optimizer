import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'
import { scalingParams } from '../util'

const key: CharacterKey = 'RuanMei'
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

let s = 0,
  u = 0,
  ta = 0,
  te = 0
const dm = {
  basic: {
    dmg: basic[0][0],
  },
  skill: {
    dmg_: skill[0][s++],
    weakness_: skill[0][s++][1],
    duration: skill[0][s++][1],
  },
  ult: {
    resPen_: ult[0][u++],
    duration: ult[0][u++][1],
    delay: ult[0][u++],
    delayFromBreak: ult[0][u++],
    breakDmg: ult[0][u++],
  },
  talent: {
    spd_: talent[0][ta++],
    breakDmg: talent[0][ta++],
  },
  technique: {
    triggers: technique[te++],
    toughness_: technique[te++],
    breakDmg: technique[te++],
    maxBlessings: technique[te++],
  },
  b1: {
    break_: bonusAbility1[0],
  },
  b2: {
    energy: bonusAbility2[0],
  },
  b3: {
    breakThreshold: bonusAbility3[0],
    perBreak: bonusAbility3[1],
    dmg_per: bonusAbility3[2],
    max_dmg_: bonusAbility3[3],
  },
  e1: {
    defIgn_: eidolon[1][0],
  },
  e2: {
    atk_: eidolon[2][0],
  },
  e4: {
    break_: eidolon[4][0],
    duration: eidolon[4][1],
  },
  e6: {
    ultDurationInc: eidolon[6][0],
    breakDmgMult_inc: eidolon[6][1],
  },
} as const

export default dm
