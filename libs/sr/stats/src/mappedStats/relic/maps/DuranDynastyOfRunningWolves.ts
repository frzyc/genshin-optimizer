import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'DuranDynastyOfRunningWolves'
const data_gen = allStats.relic[key]

let o = 0

const dm = {
  2: {
    stacks: data_gen.setEffects[0].otherStats[o++],
    followUp_: data_gen.setEffects[0].otherStats[o++],
    crit_dmg_: data_gen.setEffects[0].otherStats[o++],
  },
} as const

export default dm
