import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'PoetOfMourningCollapse'
const data_gen = allStats.relic[key]

let o = 1

const dm = {
  2: {
    passive_quantum_dmg_: data_gen.setEffects[0].passiveStats.quantum_dmg_,
  },
  4: {
    passive_spd_: data_gen.setEffects[1].passiveStats.spd_,
    spd_threshold1: data_gen.setEffects[1].otherStats[o++],
    spd_threshold2: data_gen.setEffects[1].otherStats[o++],
    crit_1: data_gen.setEffects[1].otherStats[o++],
    crit_2: data_gen.setEffects[1].otherStats[o++],
  },
} as const

export default dm
