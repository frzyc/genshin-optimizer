import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'LunarDecrescent'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  common_dmg_: data_gen[o++],
  duration: data_gen[o++][1],
} as const

export default dm
