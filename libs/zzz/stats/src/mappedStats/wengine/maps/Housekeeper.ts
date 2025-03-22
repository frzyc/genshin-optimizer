import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'Housekeeper'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  enerRegen: data_gen[o++],
  physical_dmg_: data_gen[o++],
  stacks: data_gen[o++][1],
  duration: data_gen[o++][1],
} as const

export default dm
