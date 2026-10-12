import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'FrostfallSickle'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  ice_dmg_: data_gen[o++],
  duration: data_gen[o++][1],
  stacks: data_gen[o++][1],
  stack_threshold: data_gen[o++][1],
  abloom_dmg_: data_gen[o++],
} as const

export default dm
