import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'MusketeerOfWildWheat'
const data_gen = allStats.relic[key]

let o = 1

const dm = {
  2: {
    atk_: data_gen.setEffects[0].passiveStats.atk_,
  },
  4: {
    spd_: data_gen.setEffects[1].passiveStats.spd_,
    basic_: data_gen.setEffects[1].otherStats[o++],
  },
} as const

export default dm
