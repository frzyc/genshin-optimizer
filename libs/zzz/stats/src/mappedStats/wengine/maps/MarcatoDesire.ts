import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'MarcatoDesire'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  atk_: data_gen[o++],
  duration: data_gen[o++][1],
  extra_atk_: data_gen[o++],
} as const

export default dm
