import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'KnightsExtolment'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  battleEdgeGained: data_gen[o++][1],
  crit_dmg_: data_gen[o++],
  duration: data_gen[o++][1],
  maxStacks: data_gen[o++][1],
  stacksPerSkill: data_gen[o++][1],
  stackThreshold: data_gen[o++][1],
  ice_resIgn_: data_gen[o++],
} as const

export default dm
