import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'SharpenedStinger'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  stackGain: data_gen[o++][1],
  physical_dmg_: data_gen[o++],
  duration: data_gen[o++][1],
  stacks: data_gen[o++][1],
  cooldown: data_gen[o++][1],
  stackThreshold: data_gen[o++][1],
  anomBuildup_: data_gen[o++],
} as const

export default dm
