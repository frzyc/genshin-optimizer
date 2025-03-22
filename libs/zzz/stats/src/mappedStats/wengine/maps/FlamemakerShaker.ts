import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'FlamemakerShaker'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  enerRegen: data_gen[o++],
  common_dmg_: data_gen[o++],
  stacks: data_gen[o++][1],
  duration: data_gen[o++][1],
  cooldown: data_gen[o++][1],
  stackThreshold: data_gen[o++][1],
  anomProf: data_gen[o++],
  anomProfDuration: data_gen[o++][1],
} as const

export default dm
