import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'GiantTreeOfRaptBrooding'
const data_gen = allStats.relic[key]

let o = 1

const dm = {
  2: {
    passive_spd_: data_gen.setEffects[0].passiveStats.spd_,
    spdThreshold1: data_gen.setEffects[0].otherStats[o++],
    spdThreshold2: data_gen.setEffects[0].otherStats[o++],
    heal_1: data_gen.setEffects[0].otherStats[o++],
    heal_2: data_gen.setEffects[0].otherStats[o++],
  },
} as const

export default dm
