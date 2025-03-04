import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'FlameOfBloodBlazeMyPath'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_hp_: data_gen.superimpose.passiveStats.hp_,
  passive_incHeal_: data_gen.superimpose.passiveStats.incHeal_,
  consumedHp_: data_gen.superimpose.otherStats[o++],
  skill_ult_dmg_: data_gen.superimpose.otherStats[o++],
  consumedHpThreshold: data_gen.superimpose.otherStats[o++][1],
  bonus_skill_ult_dmg_: data_gen.superimpose.otherStats[o++],
} as const

export default dm
