import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'SliceOfTime'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  decibal1: data_gen[o++],
  decibal2: data_gen[o++],
  decibal3: data_gen[o++],
  decibal4: data_gen[o++],
  energy: data_gen[o++],
  duration: data_gen[o++][1],
} as const

export default dm
