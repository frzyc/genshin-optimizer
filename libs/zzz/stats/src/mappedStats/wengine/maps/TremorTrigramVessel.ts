import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'TremorTrigramVessel'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  exSpecial_ult_dmg_: data_gen[o++],
  energyGain: data_gen[o++],
  cd: data_gen[o++][1],
} as const

export default dm
