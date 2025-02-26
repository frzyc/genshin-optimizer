import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'KnightOfPurityPalace'
const data_gen = allStats.relic[key]

let o = 0

const dm = {
  2: {
    passive_def_: data_gen.setEffects[0].passiveStats.def_,
  },
  4: {
    shield_: data_gen.setEffects[1].otherStats[o++],
  },
} as const

export default dm
