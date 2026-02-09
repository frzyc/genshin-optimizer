import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'Thoughtbop'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  enerRegen: data_gen[o++],
  common_dmg_: data_gen[o++],
  duration: data_gen[o++][1],
  maxStacks: data_gen[o++][1],
  stackThreshold: data_gen[o++][1],
  atk_: data_gen[o++],
} as const

export default dm
