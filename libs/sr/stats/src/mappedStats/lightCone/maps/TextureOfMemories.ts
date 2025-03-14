import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'TextureOfMemories'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_eff_res_: data_gen.superimpose.passiveStats.eff_res_,
  shieldScaling: data_gen.superimpose.otherStats[o++],
  duration: data_gen.superimpose.otherStats[o++][1],
  cooldown: data_gen.superimpose.otherStats[o++][1],
  dmgRed_: data_gen.superimpose.otherStats[o++],
} as const

export default dm
