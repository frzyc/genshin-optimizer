import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '../../../allStats'

const key: RelicSetKey = 'HeroOfTriumphantSong'
const data_gen = allStats.relic[key]

let o = 1

const dm = {
  2: {
    passive_atk_: data_gen.setEffects[0].passiveStats.atk_,
  },
  4: {
    passive_crit_: data_gen.setEffects[1].passiveStats.crit_,
    ult_dmg_: data_gen.setEffects[1].otherStats[o++],
    duration: data_gen.setEffects[1].otherStats[o++],
  },
} as const

export default dm
