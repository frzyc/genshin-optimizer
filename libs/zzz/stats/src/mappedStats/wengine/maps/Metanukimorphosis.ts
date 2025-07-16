import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'Metanukimorphosis'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  anomMas: data_gen[o++],
  amDuration: data_gen[o++][1],
  anomProf: data_gen[o++],
  apDuration: data_gen[o++][1],
} as const

export default dm
