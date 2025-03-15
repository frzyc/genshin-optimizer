import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { allStats } from '../../../allStats'

const key: WengineKey = 'PeacekeeperSpecialized'
const data_gen = allStats.wengine[key]

// TODO: Load scalings
const dm = {
  cond_dmg_: [
    -1,
    ...data_gen.phase.map(({ params }) => params[0] ?? 0),
  ] as number[],
  passive_atk: [
    -1,
    ...data_gen.phase.map(({ params }) => params[1] ?? 0),
  ] as number[],
  duration: data_gen.phase[0].params[2],
} as const

export default dm
