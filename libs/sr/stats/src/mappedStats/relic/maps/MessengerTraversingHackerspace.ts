import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'MessengerTraversingHackerspace'
const data_gen = allStats.relic[key]

let o = 0

const dm = {
  2: {
    passive_spd_: data_gen.setEffects[0].passiveStats.spd_,
  },
  4: {
    spd_: data_gen.setEffects[1].otherStats[o++],
    duration: data_gen.setEffects[1].otherStats[o++],
  },
} as const

export default dm
