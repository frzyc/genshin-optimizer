import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'StreetSuperstar'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  stack_gain: data_gen[o++][1],
  max_stack: data_gen[o++][1],
  dmg_: data_gen[o++],
} as const

export default dm
