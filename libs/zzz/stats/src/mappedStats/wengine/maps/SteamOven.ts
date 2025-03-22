import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'SteamOven'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  energy_accu: data_gen[o++][1],
  impact_: data_gen[o++],
  max_stack: data_gen[o++][1],
  duration: data_gen[o++][1],
} as const

export default dm
