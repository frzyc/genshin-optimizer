import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'
import { scalingParams } from '../util'

const key: CharacterKey = 'March7th'
const data_gen = allStats.char[key]
const {
  basic,
  skill,
  ult,
  talent,
  technique,
  eidolon,
  bonusAbility1,
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
    shieldMult: skill[0][s++],
    shieldDuration: skill[0][s++][0],
    allyHpThreshold: skill[0][s++][0],
    shieldBase: skill[0][s++],
    idk5: skill[0][s++][0],
  },
  ult: {
    dmg: ult[0][u++],
    freezeChance: ult[0][u++][0],
    freezeDuration: ult[0][u++][0],
    freezeDmg: ult[0][u++],
  },
  talent: {
    dmg: talent[0][ta++],
    triggers: talent[0][ta++][0],
  },
  technique: {
    freezeChance: technique[te++],
    freezeDuration: technique[te++],
    dmg: technique[te++],
  },
  ba2: {
    durationInc: bonusAbility1[0],
  },
  ba3: {
    freezeChance: bonusAbility3[0],
  },
  e2: {
    shieldMult: eidolon[2][0],
    duration: eidolon[2][1],
    shieldBase: eidolon[2][2],
  },
  e4: {
    dmgInc: eidolon[4][0],
  },
  e6: {
    healMult: eidolon[6][0],
    healBase: eidolon[6][1],
  },
} as const

export default dm
