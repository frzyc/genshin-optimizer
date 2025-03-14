import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'AnInstantBeforeAGaze'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_crit_dmg_: data_gen.superimpose.passiveStats.crit_dmg_,
  ult_dmg_: data_gen.superimpose.otherStats[o++],
  maxEnergy: data_gen.superimpose.otherStats[o++][1],
} as const

export default dm
