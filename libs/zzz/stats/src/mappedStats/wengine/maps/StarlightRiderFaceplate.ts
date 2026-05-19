import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'StarlightRiderFaceplate'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  crit_: data_gen[o++],
  physical_sheer_dmg_: data_gen[o++],
  stacks: data_gen[o++][1],
  duration: data_gen[o++][1],
} as const

export default dm
