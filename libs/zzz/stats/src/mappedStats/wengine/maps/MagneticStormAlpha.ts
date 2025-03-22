import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'MagneticStormAlpha'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  anomMas: data_gen[o++] ?? [-1, 1, 2, 3, 4, 5],
  duration: data_gen[o++][1],
  cooldown: data_gen[o++][1],
} as const

export default dm
