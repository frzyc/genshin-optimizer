import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'DeepSeaVisitor'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  passive_ice_dmg_: data_gen[o++],
  crit_: data_gen[o++],
  duration: data_gen[o++][1],
  extra_crit_: data_gen[o++],
  extra_duration: data_gen[o++][1],
} as const

export default dm
