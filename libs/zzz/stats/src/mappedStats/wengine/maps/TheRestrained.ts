import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'TheRestrained'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  daze_: data_gen[o++] ?? [-1, 1, 2, 3, 4, 5],
  duration: data_gen[o++]?.[1] ?? 0,
  stacks: data_gen[o++] ?? [-1, 1, 2, 3, 4, 5],
} as const

export default dm
