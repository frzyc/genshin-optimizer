import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'WeAreWildfire'
const data_gen = allStats.lightCone[key]

let o = 0

const dm = {
  healScaling: data_gen.superimpose.otherStats[o++],
  dmgRed_: data_gen.superimpose.otherStats[o++],
  duration: data_gen.superimpose.otherStats[o++],
} as const

export default dm
