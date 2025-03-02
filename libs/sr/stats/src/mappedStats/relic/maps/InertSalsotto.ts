import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'InertSalsotto'
const data_gen = allStats.relic[key]

let o = 1

const dm = {
  2: {
    passive_crit_: data_gen.setEffects[0].passiveStats.crit_,
    crit_threshold: data_gen.setEffects[0].otherStats[o++],
    ult_and_followUp_: data_gen.setEffects[0].otherStats[o++],
  },
} as const

export default dm
