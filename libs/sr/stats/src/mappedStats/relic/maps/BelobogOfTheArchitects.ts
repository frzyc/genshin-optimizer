import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'BelobogOfTheArchitects'
const data_gen = allStats.relic[key]

let o = 1

const dm = {
  2: {
    passive_def_: data_gen.setEffects[0].passiveStats.def,
    eff_threshold: data_gen.setEffects[0].otherStats[o++],
    extra_def_: data_gen.setEffects[0].otherStats[o++],
  },
} as const

export default dm
