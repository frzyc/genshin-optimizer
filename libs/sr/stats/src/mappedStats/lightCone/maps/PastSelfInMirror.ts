import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'PastSelfInMirror'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_brEffect_: data_gen.superimpose.passiveStats.brEffect_,
  common_dmg_: data_gen.superimpose.otherStats[o++],
  duration: data_gen.superimpose.otherStats[o++][1],
  brEffect_threshold: data_gen.superimpose.otherStats[o++][1],
  energy: data_gen.superimpose.otherStats[o++],
} as const

export default dm
