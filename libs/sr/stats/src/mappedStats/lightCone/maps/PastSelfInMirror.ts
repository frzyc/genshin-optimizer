import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'PastSelfInMirror'
const data_gen = allStats.lightCone[key]

let o = 0
const dm = {
  _brEffect_: data_gen.superimpose.otherStats[o++],
  dmg_: data_gen.superimpose.otherStats[o++],
  duration: data_gen.superimpose.otherStats[o++],
  brEffect_thresh_: data_gen.superimpose.otherStats[o++],
  enerRegn: data_gen.superimpose.otherStats[o++],
} as const

export default dm
