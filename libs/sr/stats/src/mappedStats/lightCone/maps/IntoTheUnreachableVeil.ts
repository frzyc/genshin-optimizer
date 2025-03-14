import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'IntoTheUnreachableVeil'
const data_gen = allStats.lightCone[key]

let o = 2

const dm = {
  passive_crit_: data_gen.superimpose.passiveStats.crit_,
  energyThreshold: data_gen.superimpose.otherStats[o++][1],
  skill_ult_dmg_: data_gen.superimpose.otherStats[o++],
  duration: data_gen.superimpose.otherStats[o++][1],
} as const

export default dm
