import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'TimeWovenIntoGold'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_baseSpd: data_gen.superimpose.passiveStats.baseSpd,
  stacks: data_gen.superimpose.otherStats[o++][1],
  crit_dmg_: data_gen.superimpose.otherStats[o++],
  basic_dmg_: data_gen.superimpose.otherStats[o++],
} as const

export default dm
