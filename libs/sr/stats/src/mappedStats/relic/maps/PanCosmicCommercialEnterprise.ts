import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'PanCosmicCommercialEnterprise'
const data_gen = allStats.relic[key]

let o = 1

const dm = {
  2: {
    passive_eff_: data_gen.setEffects[0].passiveStats.eff_,
    scaling: data_gen.setEffects[0].otherStats[o++],
    atk_cap: data_gen.setEffects[0].otherStats[o++],
  },
} as const

export default dm
