import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'BoneCollectionsSereneDemesne'
const data_gen = allStats.relic[key]

let o = 0
// TODO: Load scalings
const dm = {
  2: {
    cond_dmg_: data_gen.setEffects[0].otherStats[o++] ?? [1, 2],
    passive_atk: data_gen.setEffects[0].passiveStats.atk ?? 1,
  },
} as const

export default dm
