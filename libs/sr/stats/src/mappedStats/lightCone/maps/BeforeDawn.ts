import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'BeforeDawn'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_crit_dmg_: data_gen.superimpose.passiveStats.crit_dmg_,
  skill_ult_dmg_: data_gen.superimpose.otherStats[o++],
  followUp_dmg_: data_gen.superimpose.otherStats[o++],
} as const

export default dm
