import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'TaliaKingdomOfBanditry'
const data_gen = allStats.relic[key]

let o = 1

const dm = {
  2: {
    passive_brEffect_: data_gen.setEffects[0].passiveStats.brEffect_,
    spdThreshold: data_gen.setEffects[0].otherStats[o++],
    brEffect_: data_gen.setEffects[0].otherStats[o++],
  },
} as const

export default dm
