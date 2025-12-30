import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'YesterdayCalls'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  enerRegen: data_gen[o++],
  dazeInc_: data_gen[o++],
  duration: data_gen[o++][1],
  stacks: data_gen[o++][1],
  stackThreshold: data_gen[o++][1],
  crit_dmg_: data_gen[o++],
  duration1: data_gen[o++][1],
} as const

export default dm
