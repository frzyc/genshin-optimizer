import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'BlazingLaurel'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  impact_: data_gen[o++],
  duration: data_gen[o++][1],
  wilt_duration: data_gen[o++][1],
  stacks: data_gen[o++][1],
  crit_dmg_ice_fire_: data_gen[o++],
} as const

export default dm
