import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'FlightOfFancy'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  anomBuildup_: data_gen[o++],
  anomProf: data_gen[o++],
  duration: data_gen[o++][1],
  stacks: data_gen[o++][1],
  cd: data_gen[o++][1],
} as const

export default dm
