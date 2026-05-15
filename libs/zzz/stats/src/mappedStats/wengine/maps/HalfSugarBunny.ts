import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'HalfSugarBunny'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  enerRegen: data_gen[o++],
  atk_: data_gen[o++],
  hp_: data_gen[o++],
  crit_dmg_: data_gen[o++],
  duration: data_gen[o++][1],
} as const

export default dm
