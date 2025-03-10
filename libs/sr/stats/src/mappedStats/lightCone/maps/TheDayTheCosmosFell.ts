import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'TheDayTheCosmosFell'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_atk_: data_gen.superimpose.passiveStats.atk_,
  crit_dmg_: data_gen.superimpose.otherStats[o++],
  duration: data_gen.superimpose.otherStats[o++][1],
} as const

export default dm
