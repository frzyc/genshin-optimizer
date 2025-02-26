import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'DreamsMontage'
const data_gen = allStats.lightCone[key]

let o = 0
// TODO: Load scalings
const dm = {
  cond_dmg_: data_gen.superimpose.otherStats[o++] ?? [-1, 1, 2, 3, 4, 5],
  passive_atk: data_gen.superimpose.passiveStats.atk ?? [-1, 2, 4, 6, 8, 10],
} as const

export default dm
