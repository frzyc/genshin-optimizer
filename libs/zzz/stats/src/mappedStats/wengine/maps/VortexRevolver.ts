import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'VortexRevolver'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  daze_: data_gen[o++],
} as const

export default dm
