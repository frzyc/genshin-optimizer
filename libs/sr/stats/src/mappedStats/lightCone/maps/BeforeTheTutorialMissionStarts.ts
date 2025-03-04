import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'BeforeTheTutorialMissionStarts'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_eff_: data_gen.superimpose.passiveStats.eff_,
  energy: data_gen.superimpose.otherStats[o++],
} as const

export default dm
