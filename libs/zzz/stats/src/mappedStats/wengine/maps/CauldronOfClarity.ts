import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'CauldronOfClarity'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  stackGain: data_gen[o++][1],
  common_dmg_: data_gen[o++],
  stacks: data_gen[o++][1],
  duration: data_gen[o++][1],
  cooldown: data_gen[o++][1],
  stackThreshold: data_gen[o++][1],
  crit_: data_gen[o++],
} as const

export default dm
