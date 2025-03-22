import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'SeveredInnocence'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  passive_crit_dmg_: data_gen[o++],
  stackGain: data_gen[o++][1],
  crit_dmg_: data_gen[o++],
  stacks: data_gen[o++][1],
  duration: data_gen[o++][1],
  stackThreshold: data_gen[o++][1],
  electric_dmg_: data_gen[o++],
} as const

export default dm
