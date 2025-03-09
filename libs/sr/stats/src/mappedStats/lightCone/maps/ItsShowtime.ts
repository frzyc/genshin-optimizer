import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'ItsShowtime'
const data_gen = allStats.lightCone[key]

let o = 0

const dm = {
  common_dmg_: data_gen.superimpose.otherStats[o++],
  stacks: data_gen.superimpose.otherStats[o++][1],
  duration: data_gen.superimpose.otherStats[o++],
  eff_threshold: data_gen.superimpose.otherStats[o++][1],
  atk_: data_gen.superimpose.otherStats[o++],
} as const

export default dm
