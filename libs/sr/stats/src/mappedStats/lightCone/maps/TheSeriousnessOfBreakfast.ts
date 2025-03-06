import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'TheSeriousnessOfBreakfast'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_common_dmg_: data_gen.superimpose.passiveStats.common_dmg_,
  atk_: data_gen.superimpose.otherStats[o++],
  stacks: data_gen.superimpose.otherStats[o++][1],
} as const

export default dm
