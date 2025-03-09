import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'AGroundedAscent'
const data_gen = allStats.lightCone[key]

let o = 0

const dm = {
  energy: data_gen.superimpose.otherStats[o++],
  common_dmg_: data_gen.superimpose.otherStats[o++],
  duration: data_gen.superimpose.otherStats[o++][1],
  stacks: data_gen.superimpose.otherStats[o++][1],
  step: data_gen.superimpose.otherStats[o++][1],
} as const

export default dm
