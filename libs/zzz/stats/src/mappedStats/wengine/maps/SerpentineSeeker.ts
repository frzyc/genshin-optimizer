import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'SerpentineSeeker'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  crit_: data_gen[o++],
  energyConsumed: data_gen[o++][1],
  energyConsumedStep: data_gen[o++][1],
  duration: data_gen[o++][1],
  electric_defIgn_: data_gen[o++],
  maxDuration: data_gen[o++][1],
  combatEnterDuration: data_gen[o++][1],
} as const

export default dm
