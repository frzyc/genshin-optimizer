import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'ThoseManySprings'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_eff_: data_gen.superimpose.passiveStats.eff_,
  unarmoredBaseChance: data_gen.superimpose.otherStats[o++][1],
  common_dmg_: data_gen.superimpose.otherStats[o++],
  duration: data_gen.superimpose.otherStats[o++][1],
  corneredBaseChance: data_gen.superimpose.otherStats[o++][1],
  extra_common_dmg_: data_gen.superimpose.otherStats[o++],
} as const

export default dm
