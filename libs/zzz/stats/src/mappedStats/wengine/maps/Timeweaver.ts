import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'Timeweaver'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  electric_anom_buildup_: data_gen[o++],
  anomProf: data_gen[o++],
  duration: data_gen[o++][1],
  anomProf_thresh: data_gen[o++][1],
  disorder_dmg_: data_gen[o++],
} as const

export default dm
