import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { customHeal, own } from '../../util'
import { entriesForRelic, registerRelic } from '../util'

const key: RelicSetKey = 'GuardOfWutheringSnow'
const data_gen = allStats.relic[key]
const dm = mappedStats.relic[key]

const relicCount = own.common.count.sheet(key)

const sheet = registerRelic(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  // Conditional buffs
  customHeal('set4_heal', prod(own.final.hp, dm[4].hpRestore), {
    cond: cmpGE(relicCount, 4, 'unique', ''),
  }),
)
export default sheet
