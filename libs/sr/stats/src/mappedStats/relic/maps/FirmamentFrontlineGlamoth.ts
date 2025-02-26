import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'FirmamentFrontlineGlamoth'
const data_gen = allStats.relic[key]

let o = 1

const dm = {
  2: {
    atk_: data_gen.setEffects[0].passiveStats.atk_,
    spdBp1: data_gen.setEffects[0].otherStats[o++],
    spdBp2: data_gen.setEffects[0].otherStats[o++],
    common_dmg_1: data_gen.setEffects[0].otherStats[o++],
    common_dmg_2: data_gen.setEffects[0].otherStats[o++],
  },
} as const

export default dm
