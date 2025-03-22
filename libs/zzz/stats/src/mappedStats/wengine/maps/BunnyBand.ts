import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'BunnyBand'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  hp_: data_gen[o++],
  atk_: data_gen[o++],
} as const

export default dm
