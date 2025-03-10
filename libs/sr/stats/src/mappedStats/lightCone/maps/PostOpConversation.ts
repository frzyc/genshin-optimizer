import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'PostOpConversation'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_enerRegen_: data_gen.superimpose.passiveStats.enerRegen_,
  heal_: data_gen.superimpose.otherStats[o++],
} as const

export default dm
