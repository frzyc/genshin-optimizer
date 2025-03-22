import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'ZanshinHerbCase'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  crit_: data_gen[o++],
  electric_: data_gen[o++],
  anom_stun_crit_: data_gen[o++],
  duration: data_gen[o++][1],
} as const

export default dm
