import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'
import { scalingParams } from '../util'

const key: CharacterKey = 'Seele'
const data_gen = allStats.char[key]
const {
  basic,
  skill,
  ult,
  talent,
  technique,
  eidolon,
  // bonusAbility1,
  bonusAbility2,
  // bonusAbility3,
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
    spd_: skill[0][s++][1],
    duration: skill[0][s++][1],
  },
  ult: {
    dmg: ult[0][u++],
  },
  talent: {
    dmg_: talent[0][ta++],
  },
  technique: {
    duration: technique[te++],
  },
  b2: {
    resPen_quantum: bonusAbility2[0],
  },
  e1: {
    crit_: eidolon[1][1],
  },
  e6: {
    dmg: eidolon[6][0],
  },
} as const

export default dm
