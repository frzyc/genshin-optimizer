import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'QuidProQuo'
const data_gen = allStats.lightCone[key]

let o = 0

const dm = {
  energy_threshold: data_gen.superimpose.otherStats[o++],
  energy: data_gen.superimpose.otherStats[o++],
} as const

export default dm
