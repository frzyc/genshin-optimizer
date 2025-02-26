import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'BrokenKeel'
const data_gen = allStats.relic[key]

let o = 1

const dm = {
  2: {
    passive_eff_res_: data_gen.setEffects[0].passiveStats.eff_res_,
    eff_res_threshold: data_gen.setEffects[0].otherStats[o++],
    team_crit_dmg_: data_gen.setEffects[0].otherStats[o++],
  },
} as const

export default dm
