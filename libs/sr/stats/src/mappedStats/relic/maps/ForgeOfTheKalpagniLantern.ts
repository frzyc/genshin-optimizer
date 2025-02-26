import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'ForgeOfTheKalpagniLantern'
const data_gen = allStats.relic[key]

let o = 1

const dm = {
  2: {
    spd_: data_gen.setEffects[0].passiveStats.spd_,
    brEffect_: data_gen.setEffects[0].otherStats[o++],
    duration: data_gen.setEffects[0].otherStats[o++],
  },
} as const

export default dm
