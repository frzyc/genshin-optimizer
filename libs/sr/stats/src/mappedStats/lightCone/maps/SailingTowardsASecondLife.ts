import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'SailingTowardsASecondLife'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_brEffect_: data_gen.superimpose.passiveStats.brEffect_,
  brEffect_threshold: data_gen.superimpose.otherStats[o++][1],
  break_defIgn_: data_gen.superimpose.otherStats[o++],
  spd_: data_gen.superimpose.otherStats[o++],
} as const

export default dm
