import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'TheUnreachableSide'
const data_gen = allStats.lightCone[key]

let o = 2

const dm = {
  passive_crit_: data_gen.superimpose.passiveStats.crit_,
  passive_hp_: data_gen.superimpose.passiveStats.hp_,
  common_dmg_: data_gen.superimpose.otherStats[o++],
} as const

export default dm
