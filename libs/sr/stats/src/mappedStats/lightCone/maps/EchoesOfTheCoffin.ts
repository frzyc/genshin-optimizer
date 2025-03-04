import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: LightConeKey = 'EchoesOfTheCoffin'
const data_gen = allStats.lightCone[key]

let o = 1

const dm = {
  passive_atk_: data_gen.superimpose.passiveStats.atk_,
  spd: data_gen.superimpose.otherStats[o++],
  energy: data_gen.superimpose.otherStats[o++],
  maxProcs: data_gen.superimpose.otherStats[o++][1],
} as const

export default dm
