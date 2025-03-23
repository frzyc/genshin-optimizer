import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'LongRoadLeadsHome'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_brEffect_: data_gen.superimpose.passiveStats.brEffect_,
  baseChance: data_gen.superimpose.otherStats[o++][1],
  break_dmg_: data_gen.superimpose.otherStats[o++],
  duration: data_gen.superimpose.otherStats[o++][1],
  stacks: data_gen.superimpose.otherStats[o++][1],
} as const

export default dm
