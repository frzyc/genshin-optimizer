import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'PerfectTiming'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_eff_res_: data_gen.superimpose.passiveStats.eff_res_,
  heal_scaling: data_gen.superimpose.otherStats[o++],
  max_heal_: data_gen.superimpose.otherStats[o++],
} as const

export default dm
