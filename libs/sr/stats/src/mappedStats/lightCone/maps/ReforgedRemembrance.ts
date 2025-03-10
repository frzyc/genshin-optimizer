import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'ReforgedRemembrance'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_eff_: data_gen.superimpose.passiveStats.eff_,
  atk_: data_gen.superimpose.otherStats[o++],
  dot_defIgn_: data_gen.superimpose.otherStats[o++],
  stacks: data_gen.superimpose.otherStats[o++][1],
} as const

export default dm
