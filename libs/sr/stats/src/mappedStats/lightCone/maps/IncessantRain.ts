import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'IncessantRain'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_eff_: data_gen.superimpose.passiveStats.eff_,
  baseChance: data_gen.superimpose.otherStats[o++][1],
  crit_: data_gen.superimpose.otherStats[o++],
  debuffCount: data_gen.superimpose.otherStats[o++][1],
  common_dmg_: data_gen.superimpose.otherStats[o++],
} as const

export default dm
