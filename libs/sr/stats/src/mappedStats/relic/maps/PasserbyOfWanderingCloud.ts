import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'PasserbyOfWanderingCloud'
const data_gen = allStats.relic[key]

const dm = {
  2: {
    passive_heal_: data_gen.setEffects[0].passiveStats.heal_,
  },
  4: {},
} as const

export default dm
