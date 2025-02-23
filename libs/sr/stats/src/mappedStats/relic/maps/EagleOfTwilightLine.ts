import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'EagleOfTwilightLine'
const data_gen = allStats.relic[key]

let o = 0

const dm = {
  2: {
    wind_dmg_: data_gen.setEffects[0].passiveStats.wind_dmg_,
  },
  4: {
    advance_: data_gen.setEffects[1].otherStats[o++],
  }
} as const

export default dm
