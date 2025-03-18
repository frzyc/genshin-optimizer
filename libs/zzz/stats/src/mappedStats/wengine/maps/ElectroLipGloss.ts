import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'ElectroLipGloss'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  atk_: data_gen[o++],
  common_dmg_: data_gen[o++],
} as const

export default dm
