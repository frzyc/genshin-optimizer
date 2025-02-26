import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'GuardOfWutheringSnow'
const data_gen = allStats.relic[key]

let o = 0

const dm = {
  2: {
    dmgRed_: data_gen.setEffects[0].otherStats[o++],
  },
  4: {
    hpThreshold: data_gen.setEffects[1].otherStats[o++],
    hpRestore: data_gen.setEffects[1].otherStats[o++],
    energyRegen: data_gen.setEffects[1].otherStats[o++],
  },
} as const

export default dm
