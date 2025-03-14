import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'FlowingNightglow'
const data_gen = allStats.lightCone[key]

let o = 0

const dm = {
  enerRegen_: data_gen.superimpose.otherStats[o++],
  stacks: data_gen.superimpose.otherStats[o++][1],
  common_dmg_: data_gen.superimpose.otherStats[o++],
  atk_: data_gen.superimpose.otherStats[o++],
  duration: data_gen.superimpose.otherStats[o++],
} as const

export default dm
