import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'SpectralGaze'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  defRed_: data_gen[o++],
  duration1: data_gen[o++][1],
  stack_gain: data_gen[o++][1],
  max_stack: data_gen[o++][1],
  impact_: data_gen[o++],
  duration2: data_gen[o++][1],
  add_impact_: data_gen[o++],
} as const
export default dm
