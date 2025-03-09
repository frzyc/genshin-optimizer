import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'SharedFeeling'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_heal_: data_gen.superimpose.passiveStats.heal_,
  energy: data_gen.superimpose.otherStats[o++],
} as const

export default dm
