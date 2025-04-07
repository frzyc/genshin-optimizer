import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'WeepingGemini'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  anomProf: data_gen[o++],
  stacks: data_gen[o++][1],
} as const

export default dm
