import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'Shadowburn'
const data_gen = allStats.lightCone[key]

let o = 0

const dm = {
  skillPoints: data_gen.superimpose.otherStats[o++][1],
  energy: data_gen.superimpose.otherStats[o++],
} as const

export default dm
