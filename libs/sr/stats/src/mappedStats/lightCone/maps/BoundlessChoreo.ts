import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'BoundlessChoreo'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_crit_: data_gen.superimpose.passiveStats.crit_,
  crit_dmg_: data_gen.superimpose.otherStats[o++],
} as const

export default dm
