import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'GeniusOfBrilliantStars'
const data_gen = allStats.relic[key]

let o = 0

const dm = {
  2: {
    passive_quantum_dmg_: data_gen.setEffects[0].passiveStats.quantum_dmg_,
  },
  4: {
    defIgn_: data_gen.setEffects[1].otherStats[o++],
    addDefIgn_: data_gen.setEffects[1].otherStats[o++],
  }
} as const

export default dm
