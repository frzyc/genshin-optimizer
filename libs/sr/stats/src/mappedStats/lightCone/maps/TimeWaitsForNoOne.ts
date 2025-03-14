import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'TimeWaitsForNoOne'
const data_gen = allStats.lightCone[key]

let o = 2

const dm = {
  passive_hp_: data_gen.superimpose.passiveStats.hp_,
  passive_heal_: data_gen.superimpose.passiveStats.heal_,
  additional_dmg_scaling: data_gen.superimpose.otherStats[o++],
} as const

export default dm
