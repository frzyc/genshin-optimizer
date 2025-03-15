import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'Reminiscence'
const data_gen = allStats.lightCone[key]

let o = 0

const dm = {
  common_dmg_: data_gen.superimpose.otherStats[o++],
  stacks: data_gen.superimpose.otherStats[o++][1],
} as const

export default dm
