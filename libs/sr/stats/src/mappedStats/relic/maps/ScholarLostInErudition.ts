import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'ScholarLostInErudition'
const data_gen = allStats.relic[key]

let o = 0

const dm = {
  2: {
    passive_crit_: data_gen.setEffects[0].passiveStats.crit_,
  },
  4: {
    skill_ult_dmg_: data_gen.setEffects[1].otherStats[o++],
    skill_dmg_: data_gen.setEffects[1].otherStats[o++],
  },
} as const

export default dm
