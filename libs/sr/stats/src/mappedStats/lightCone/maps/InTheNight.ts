import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'InTheNight'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_crit_: data_gen.superimpose.passiveStats.crit_,
  spdStep: data_gen.superimpose.otherStats[o++][1],
  basic_skill_dmg_: data_gen.superimpose.otherStats[o++],
  ult_crit_dmg_: data_gen.superimpose.otherStats[o++],
  stacks: data_gen.superimpose.otherStats[o++][1],
} as const

export default dm
