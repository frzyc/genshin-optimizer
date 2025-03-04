import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'BrighterThanTheSun'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_crit_: data_gen.superimpose.passiveStats.crit_,
  stacks: data_gen.superimpose.otherStats[o++][1],
  duration: data_gen.superimpose.otherStats[o++][1],
  atk_: data_gen.superimpose.otherStats[o++],
  enerRegen_: data_gen.superimpose.otherStats[o++],
} as const

export default dm
