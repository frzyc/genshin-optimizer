import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'PenaconyLandOfTheDreams'
const data_gen = allStats.relic[key]

let o = 1

const dm = {
  2: {
    passive_enerRegen_: data_gen.setEffects[0].passiveStats.enerRegen_,
    common_dmg_: data_gen.setEffects[0].otherStats[o++],
  },
} as const

export default dm
