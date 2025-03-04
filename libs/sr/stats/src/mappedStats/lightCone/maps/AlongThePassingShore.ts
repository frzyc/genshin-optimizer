import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'AlongThePassingShore'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_crit_dmg_: data_gen.superimpose.passiveStats.crit_dmg_,
  common_dmg_: data_gen.superimpose.otherStats[o++],
  ult_dmg_: data_gen.superimpose.otherStats[o++],
} as const

export default dm
