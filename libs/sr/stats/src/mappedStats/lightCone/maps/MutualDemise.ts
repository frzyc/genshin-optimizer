import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'MutualDemise'
const data_gen = allStats.lightCone[key]

let o = 0

const dm = {
  hp_threshold: data_gen.superimpose.otherStats[o++],
  crit_: data_gen.superimpose.otherStats[o++],
} as const

export default dm
