import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'PreciousFossilizedCore'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  enemy_hp_threshold1: data_gen[o++][1],
  daze_: data_gen[o++],
  enemy_hp_threshold2: data_gen[o++][1],
  extra_daze_: data_gen[o++],
} as const

export default dm
