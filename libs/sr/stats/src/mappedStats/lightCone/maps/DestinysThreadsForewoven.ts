import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'DestinysThreadsForewoven'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_eff_res_: data_gen.superimpose.passiveStats.eff_res_,
  step: data_gen.superimpose.otherStats[o++][1],
  common_dmg_: data_gen.superimpose.otherStats[o++],
  max_common_dmg_: data_gen.superimpose.otherStats[o++],
} as const

export default dm
