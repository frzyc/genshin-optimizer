import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'ConcertForTwo'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_def_: data_gen.superimpose.passiveStats.def_,
  common_dmg_: data_gen.superimpose.otherStats[o++],
} as const

export default dm
