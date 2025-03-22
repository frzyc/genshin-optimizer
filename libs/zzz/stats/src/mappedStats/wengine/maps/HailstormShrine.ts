import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'HailstormShrine'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  passive_crit_dmg_: data_gen[o++],
  ice_dmg_: data_gen[o++],
  stacks: data_gen[o++][1],
  duration: data_gen[o++][1],
} as const

export default dm
