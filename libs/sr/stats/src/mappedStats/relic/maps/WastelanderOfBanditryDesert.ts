import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'WastelanderOfBanditryDesert'
const data_gen = allStats.relic[key]

let o = 0

const dm = {
  2: {
    passive_imaginary_dmg_: data_gen.setEffects[0].passiveStats.imaginary_dmg_,
  },
  4: {
    crit_: data_gen.setEffects[1].otherStats[o++],
    crit_dmg_: data_gen.setEffects[1].otherStats[o++],
  },
} as const

export default dm
