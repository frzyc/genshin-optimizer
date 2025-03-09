import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'NinjutsuInscriptionDazzlingEvilbreaker'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_brEffect_: data_gen.superimpose.passiveStats.brEffect_,
  energy: data_gen.superimpose.otherStats[o++],
  actionAdvance_: data_gen.superimpose.otherStats[o++],
} as const

export default dm
