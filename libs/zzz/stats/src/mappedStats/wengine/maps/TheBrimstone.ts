import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'TheBrimstone'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  atk_: data_gen[o++],
  duration: data_gen[o++][1],
  stack: data_gen[o++][1],
  cooldown: data_gen[o++][1],
} as const

export default dm
