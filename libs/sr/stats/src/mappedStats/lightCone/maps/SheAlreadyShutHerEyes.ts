import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'SheAlreadyShutHerEyes'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_hp_: data_gen.superimpose.passiveStats.hp_,
  passive_enerRegen_: data_gen.superimpose.passiveStats.enerRegen_,
  common_dmg_: data_gen.superimpose.otherStats[o++],
  healScaling: data_gen.superimpose.otherStats[o++],
  duration: data_gen.superimpose.otherStats[4][1],
} as const

export default dm
