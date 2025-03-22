import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'SixShooter'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  stack_gen: data_gen[o++][1],
  cooldown: data_gen[o++][1],
  max_stack: data_gen[o++][1],
  daze_: data_gen[o++],
} as const

export default dm
