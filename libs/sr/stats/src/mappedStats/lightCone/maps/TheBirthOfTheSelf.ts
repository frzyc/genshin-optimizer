import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'TheBirthOfTheSelf'
const data_gen = allStats.lightCone[key]

let o = 0

const dm = {
  followUp_dmg_: data_gen.superimpose.otherStats[o++],
  hp_threshold: data_gen.superimpose.otherStats[o++],
  extra_followUp_dmg_: data_gen.superimpose.otherStats[o++],
} as const

export default dm
