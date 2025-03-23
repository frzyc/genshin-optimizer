import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'ResolutionShinesAsPearlsOfSweat'
const data_gen = allStats.lightCone[key]

let o = 0

const dm = {
  baseChance: data_gen.superimpose.otherStats[o++],
  defRed_: data_gen.superimpose.otherStats[o++],
  duration: data_gen.superimpose.otherStats[o++][1],
} as const

export default dm
