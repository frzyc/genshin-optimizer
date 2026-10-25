import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'PlumeOfRebirth'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  anomProf: data_gen[o++],
  fire_dmg_: data_gen[o++],
  duration: data_gen[o++][1],
} as const

export default dm
