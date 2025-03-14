import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'IndeliblePromise'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_brEffect_: data_gen.superimpose.passiveStats.brEffect_,
  crit_: data_gen.superimpose.otherStats[o++],
  duration: data_gen.superimpose.otherStats[o++],
} as const

export default dm
