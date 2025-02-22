import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'WatchmakerMasterOfDreamMachinations'
const data_gen = allStats.relic[key]
let o = 0
const dm = {
  2: {
    brEffect_: data_gen.setEffects[0].passiveStats.brEffect_,
  },
  4: {
    brEffect_: data_gen.setEffects[1].otherStats[o++],
    duration: data_gen.setEffects[1].otherStats[o++],
  },
} as const

export default dm
