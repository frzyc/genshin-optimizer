import type { WengineKey } from '@genshin-optimizer/zzz-consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'JoyauDore'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  anomProf: data_gen[o++],
  vortex_windswept_dmg_: data_gen[o++],
  duration: data_gen[o++][1],
  stacks: data_gen[o++][1],
  stackThreshold: data_gen[o++][1],
  teamAnomProf: data_gen[o++],
} as const

export default dm
