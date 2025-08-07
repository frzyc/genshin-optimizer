import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'PracticedPerfection'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  anomMas: data_gen[o++],
  phys_dmg_: data_gen[o++],
  duration: data_gen[o++][1],
  maxStacks: data_gen[o++][1],
  combatGainStacks: data_gen[o++][1],
} as const

export default dm
