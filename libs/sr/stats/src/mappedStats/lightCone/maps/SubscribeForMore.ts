import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'SubscribeForMore'
const data_gen = allStats.lightCone[key]

let o = 0

const dm = {
  basic_skill_dmg_: data_gen.superimpose.otherStats[o++],
  extra_basic_skill_dmg_: data_gen.superimpose.otherStats[o++],
} as const

export default dm
