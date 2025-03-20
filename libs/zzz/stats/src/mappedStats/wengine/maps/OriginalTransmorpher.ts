import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'OriginalTransmorpher'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  passive_hp_: data_gen[o++],
  impact_: data_gen[o++],
  duration: data_gen[o++][1],
} as const

export default dm
