import type { WengineKey } from '@genshin-optimizer/zzz-consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'NeonFantasies'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  anomProf: data_gen[o++],
  common_dmg_: data_gen[o++],
  duration: data_gen[o++][1],
  stacks: data_gen[o++][1],
  stackThreshold: data_gen[o++][1],
  cond_anomProf: data_gen[o++],
} as const

export default dm
