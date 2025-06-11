import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'RadiowaveJourney'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  stackGain: data_gen[o++][1],
  sheerForce: data_gen[o++],
  maxStacks: data_gen[o++][1],
  duration: data_gen[o++][1],
} as const

export default dm
