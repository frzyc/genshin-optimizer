import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'BigCylinder'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  dmg_red_: data_gen[o++],
  dmg_scaling: data_gen[o++],
  cooldown: data_gen[o++][1],
} as const

export default dm
