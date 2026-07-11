import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'BoisterousEchoes'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  energy: data_gen[o++],
  cooldown: data_gen[o++][1],
  common_dmg_: data_gen[o++],
} as const

export default dm
