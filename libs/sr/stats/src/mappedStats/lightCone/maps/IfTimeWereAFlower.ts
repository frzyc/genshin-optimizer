import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'IfTimeWereAFlower'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_crit_dmg_: data_gen.superimpose.passiveStats.crit_dmg_,
  energy: data_gen.superimpose.otherStats[o++][1],
  duration: data_gen.superimpose.otherStats[o++][1],
  crit_dmg_: data_gen.superimpose.otherStats[o++],
  startEnergy: data_gen.superimpose.otherStats[o++][1],
  startDuration: data_gen.superimpose.otherStats[o++][1],
} as const

export default dm
