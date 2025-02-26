import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'LongevousDisciple'
const data_gen = allStats.relic[key]

let o = 0

const dm = {
  2: {
    hp_: data_gen.setEffects[0].passiveStats.hp_,
  },
  4: {
    crit_: data_gen.setEffects[1].otherStats[o++],
    duration: data_gen.setEffects[1].otherStats[o++],
    stacks: data_gen.setEffects[1].otherStats[o++],
  },
} as const

export default dm
