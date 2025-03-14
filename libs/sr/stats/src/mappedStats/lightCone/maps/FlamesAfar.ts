import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'FlamesAfar'
const data_gen = allStats.lightCone[key]

let o = 0

const dm = {
  consumedThreshold: data_gen.superimpose.otherStats[o++][1],
  common_dmg_: data_gen.superimpose.otherStats[o++],
  heal: data_gen.superimpose.otherStats[o++][1],
  duration: data_gen.superimpose.otherStats[o++][1],
  coolDown: data_gen.superimpose.otherStats[o++][1],
} as const

export default dm
