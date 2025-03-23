import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'DreamsMontage'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_spd_: data_gen.superimpose.passiveStats.spd_,
  energy: data_gen.superimpose.otherStats[o++],
  maxTriggers: data_gen.superimpose.otherStats[o++][1],
} as const

export default dm
