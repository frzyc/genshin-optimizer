import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'QingmingBirdcage'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  crit_: data_gen[o++],
  stackGain: data_gen[o++][1],
  maxStacks: data_gen[o++][1],
  duration: data_gen[o++][1],
  enterCombatStacks: data_gen[o++][1],
  ether_dmg_: data_gen[o++],
  ult_exSpecial_sheer_ether_dmg_: data_gen[o++],
} as const

export default dm
