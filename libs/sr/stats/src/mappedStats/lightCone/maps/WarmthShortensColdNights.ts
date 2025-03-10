import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'WarmthShortensColdNights'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_hp_: data_gen.superimpose.passiveStats.hp_,
  healScaling: data_gen.superimpose.otherStats[o++],
} as const

export default dm
