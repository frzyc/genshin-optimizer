import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'RoaringRide'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  duration: data_gen[o++][1],
  cooldown: data_gen[o++][1],
  atk_: data_gen[o++],
  anomProf: data_gen[o++],
  anomBuildupRate: data_gen[o++],
} as const

export default dm
