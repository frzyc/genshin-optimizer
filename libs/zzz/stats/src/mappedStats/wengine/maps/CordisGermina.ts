import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'CordisGermina'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  passive_crit_: data_gen[o++],
  stack_gain: data_gen[o++][1],
  electric_dmg_: data_gen[o++],
  stacks: data_gen[o++][1],
  duration: data_gen[o++][1],
  stack_threshold: data_gen[o++][1],
  basic_ult_defIgn_: data_gen[o++],
} as const

export default dm
