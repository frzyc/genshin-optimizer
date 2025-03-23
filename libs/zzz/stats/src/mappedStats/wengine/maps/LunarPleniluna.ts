import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'LunarPleniluna'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  basic_dash_dodgeCounter_dmg_: data_gen[o++],
} as const

export default dm
