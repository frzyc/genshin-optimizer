import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'LandausChoice'
const data_gen = allStats.lightCone[key]

let o = 0

const dm = {
  chanceAttacked: data_gen.superimpose.otherStats[o++][1],
  dmgReduced_: data_gen.superimpose.otherStats[o++],
} as const

export default dm
