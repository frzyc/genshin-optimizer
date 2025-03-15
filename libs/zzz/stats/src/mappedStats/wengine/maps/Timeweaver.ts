import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'Timeweaver'
const data_gen = getWengineParams(key)

let o = 0

// TODO: Load scalings
const dm = {
  cond_dmg_: data_gen[o++] ?? [-1, 1, 2, 3, 4, 5],
  passive_atk: data_gen[o++] ?? [-1, 1, 2, 3, 4, 5],
  duration: data_gen[o++]?.[1] ?? 0,
} as const

export default dm
