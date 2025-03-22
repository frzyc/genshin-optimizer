import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'RiotSuppressorMarkVI'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  passive_crit_: data_gen[o++],
  stacksGained: data_gen[o++][1],
  stacks: data_gen[o++][1],
  basic_ether_dmg_: data_gen[o++],
} as const

export default dm
