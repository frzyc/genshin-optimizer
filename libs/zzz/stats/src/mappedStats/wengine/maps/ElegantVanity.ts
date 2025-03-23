import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'ElegantVanity'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  energy: data_gen[o++],
  duration: data_gen[o++][1],
  energyConsumed: data_gen[o++][1],
  common_dmg_: data_gen[o++],
  stacks: data_gen[o++][1],
  buffDuration: data_gen[o++][1],
} as const

export default dm
