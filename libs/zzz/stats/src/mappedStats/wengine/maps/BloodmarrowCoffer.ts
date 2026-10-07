import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'BloodmarrowCoffer'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  crit_threshold: data_gen[o++][1],
  crit_step: data_gen[o++][1],
  crit_threshold2: data_gen[o++][1],
  dmg_: data_gen[o++],
  max_dmg_: data_gen[o++],
} as const

export default dm
