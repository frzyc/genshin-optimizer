import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'BashfulDemon'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  ice_: data_gen[o++],
  atk_: data_gen[o++],
  duration: data_gen[o++][1],
  stack: data_gen[o++][1],
} as const

export default dm
