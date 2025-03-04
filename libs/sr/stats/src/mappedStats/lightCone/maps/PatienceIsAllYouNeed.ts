import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'PatienceIsAllYouNeed'
const data_gen = allStats.lightCone[key]

let o = 2

const dm = {
  passive_common_dmg_: data_gen.superimpose.passiveStats.common_dmg_,
  erode: data_gen.superimpose.otherStats[0],
  spd_: data_gen.superimpose.otherStats[o++],
  stacks: data_gen.superimpose.otherStats[o++][1],
  duration: data_gen.superimpose.otherStats[o++][1],
} as const

export default dm
