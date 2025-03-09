import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'Defense'
const data_gen = allStats.lightCone[key]

let o = 0

const dm = {
  healAmountByHp: data_gen.superimpose.otherStats[o++],
} as const

export default dm
