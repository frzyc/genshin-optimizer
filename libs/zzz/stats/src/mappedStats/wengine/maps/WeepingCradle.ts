import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'WeepingCradle'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  enerRegen: data_gen[o++],
  dmg_: data_gen[o++],
  duration: data_gen[o++]?.[1],
  inc_dmg_: data_gen[o++],
  period: data_gen[o++]?.[1],
  max_dmg_: data_gen[o++],
} as const

export default dm
