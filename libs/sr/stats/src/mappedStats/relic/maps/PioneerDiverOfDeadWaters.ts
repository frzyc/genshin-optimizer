import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'PioneerDiverOfDeadWaters'
const data_gen = allStats.relic[key]

let o = 0

const dm = {
  2: {
    dmg_: data_gen.setEffects[0].otherStats[o++],
  },
  4: {
    crit_: data_gen.setEffects[1].otherStats[0],
    crit_dmg_1: data_gen.setEffects[1].otherStats[o++],
    crit_dmg_2: data_gen.setEffects[1].otherStats[o++],
    debuffThreshold1: data_gen.setEffects[1].otherStats[o++],
    debuffThreshold2: data_gen.setEffects[1].otherStats[o++],
    duration: data_gen.setEffects[1].otherStats[o++],
  },
} as const

export default dm
