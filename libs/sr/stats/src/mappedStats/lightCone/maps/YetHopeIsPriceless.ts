import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'YetHopeIsPriceless'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_crit_: data_gen.superimpose.passiveStats.crit_,
  crit_dmg_threshold: data_gen.superimpose.otherStats[o++][1],
  step: data_gen.superimpose.otherStats[o++][1],
  followUp_dmg_: data_gen.superimpose.otherStats[o++],
  stacks: data_gen.superimpose.otherStats[o++][1],
  ult_followUp_defIgn_: data_gen.superimpose.otherStats[o++],
  duration: data_gen.superimpose.otherStats[o++][1],
} as const

export default dm
