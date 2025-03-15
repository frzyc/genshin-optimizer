import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { allStats } from '../../../allStats'

const key: WengineKey = 'BashfulDemon'
const data_gen = allStats.wengine[key]

const dm = {
  ice_: [-1, ...data_gen.phase.map(({ params }) => params[0])] as number[],
  atk_: [-1, ...data_gen.phase.map(({ params }) => params[1])] as number[],
  duration: data_gen.phase[0].params[2],
  stack: data_gen.phase[0].params[3],
} as const

export default dm
