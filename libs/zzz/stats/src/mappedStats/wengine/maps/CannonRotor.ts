import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'CannonRotor'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  passive_atk_: data_gen[o++],
  dmg_scaling: data_gen[o++],
  cooldown: data_gen[o++],
} as const

export default dm
