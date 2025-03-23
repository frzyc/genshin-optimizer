import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'DanceAtSunset'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_crit_dmg_: data_gen.superimpose.passiveStats.crit_dmg_,
  stacksAndDuration: data_gen.superimpose.otherStats[o++][1],
  followUp_dmg_: data_gen.superimpose.otherStats[o++],
  aggro: data_gen.superimpose.otherStats[o++][1],
} as const

export default dm
