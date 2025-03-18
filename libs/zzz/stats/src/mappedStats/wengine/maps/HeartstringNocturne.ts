import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'HeartstringNocturne'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  passive_crit_dmg_: data_gen[o++],
  stackGain: data_gen[o++][1],
  chain_ult_resIgn_fire_: data_gen[o++],
  stacks: data_gen[o++][1],
  duration: data_gen[o++][1],
} as const

export default dm
