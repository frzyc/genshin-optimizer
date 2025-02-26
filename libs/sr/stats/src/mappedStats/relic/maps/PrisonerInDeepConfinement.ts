import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'PrisonerInDeepConfinement'
const data_gen = allStats.relic[key]

let o = 0

const dm = {
  2: {
    passive_atk_: data_gen.setEffects[0].passiveStats.atk_,
  },
  4: {
    defIgn_: data_gen.setEffects[1].otherStats[o++],
    stacks: data_gen.setEffects[1].otherStats[o++],
  },
} as const

export default dm
