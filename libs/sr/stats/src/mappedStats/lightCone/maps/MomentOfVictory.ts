import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'MomentOfVictory'
const data_gen = allStats.lightCone[key]

let o = 2

const dm = {
  passive_def_: data_gen.superimpose.passiveStats.def_,
  passive_eff_: data_gen.superimpose.passiveStats.eff_,
  def_: data_gen.superimpose.otherStats[o++],
} as const

export default dm
