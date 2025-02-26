import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'
import { scalingParams } from '../util'

const key: CharacterKey = 'Mydei'
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
// TODO: Load scalings
const dm = {
  basic: {
    dmg: basic[0][0],
  },
  skill: {
    dmg: skill[0][s++],
  },
  ult: {
    dmg: ult[0][u++],
  },
  talent: {
    dmg: talent[0][ta++],
  },
  technique: {
    dmg: technique[te++] ?? 0,
  },
  e1: {
    dmg: eidolon[1][0] ?? 0,
  },
  b1: {
    break_: bonusAbility1[0] ?? 0,
  },
  b2: {
    energy: bonusAbility2[0] ?? 0,
  },
  b3: {
    breakThreshold: bonusAbility3[0] ?? 0,
  },
} as const

export default dm
