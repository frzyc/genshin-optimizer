import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'NightOfFright'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_enerRegen_: data_gen.superimpose.passiveStats.enerRegen_,
  healAmount: data_gen.superimpose.otherStats[o++],
  atk_: data_gen.superimpose.otherStats[o++],
  stacks: data_gen.superimpose.otherStats[o++][1],
  duration: data_gen.superimpose.otherStats[o++][1],
} as const

export default dm
