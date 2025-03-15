import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '@genshin-optimizer/sr/stats'
import { entriesForRelic, registerRelic } from '../util'

const key: RelicSetKey = 'KnightOfPurityPalace'
const data_gen = allStats.relic[key]

const sheet = registerRelic(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),
  // TODO: Shield strength?
)
export default sheet
