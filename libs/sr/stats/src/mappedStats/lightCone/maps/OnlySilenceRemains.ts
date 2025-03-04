import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'OnlySilenceRemains'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_atk_: data_gen.superimpose.passiveStats.atk_,
  crit_: data_gen.superimpose.otherStats[o++],
} as const

export default dm
