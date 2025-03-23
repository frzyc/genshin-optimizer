import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '../../../wengine'

const key: WengineKey = 'PeacekeeperSpecialized'
const data_gen = getWengineParams(key)

let o = 0

const dm = {
  enerRegen: data_gen[o++],
  passive_exSpecial_assist_anomBuildup_: data_gen[o++],
} as const

export default dm
