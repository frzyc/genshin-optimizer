import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'FleetOfTheAgeless'
const data_gen = allStats.relic[key]

let o = 1

const dm = {
  2: {
    passive_hp_: data_gen.setEffects[0].passiveStats.hp_,
    spdBp: data_gen.setEffects[0].otherStats[o++],
    atk_: data_gen.setEffects[0].otherStats[o++],
  },
} as const

export default dm
