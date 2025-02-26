import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'IronCavalryAgainstTheScourge'
const data_gen = allStats.relic[key]

let o = 0

const dm = {
  2: {
    brEffect_: data_gen.setEffects[0].passiveStats.brEffect_,
  },
  4: {
    brEffect_threshold1: data_gen.setEffects[1].otherStats[o++],
    brEffect_threshold2: data_gen.setEffects[1].otherStats[o++],
    break_defIgn_: data_gen.setEffects[1].otherStats[o++],
    superBreak_defIgn_: data_gen.setEffects[1].otherStats[o++],
  },
} as const

export default dm
