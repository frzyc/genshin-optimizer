import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'FiresmithOfLavaForging'
const data_gen = allStats.relic[key]

let o = 0

const dm = {
  2: {
    fire_dmg_: data_gen.setEffects[0].passiveStats.fire_dmg_,
  },
  4: {
    skill_dmg: data_gen.setEffects[1].otherStats[o++],
    fire_dmg_: data_gen.setEffects[1].otherStats[o++],
  }
} as const

export default dm
