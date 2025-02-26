import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'CelestialDifferentiator'
const data_gen = allStats.relic[key]

let o = 1

const dm = {
  2: {
    passive_crit_dmg: data_gen.setEffects[0].passiveStats.crit_dmg_,
    crit_dmg_threshold: data_gen.setEffects[0].otherStats[o++],
    crit_: data_gen.setEffects[0].otherStats[o++],
  },
} as const

export default dm
