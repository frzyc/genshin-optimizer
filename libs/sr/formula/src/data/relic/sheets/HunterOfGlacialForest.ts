import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForRelic, registerRelic } from '../util'

const key: RelicSetKey = 'HunterOfGlacialForest'
const data_gen = allStats.relic[key]
const dm = mappedStats.relic[key]

const relicCount = own.common.count.sheet(key)

const { ultUsed } = allBoolConditionals(key)

const sheet = registerRelic(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  // Conditional buffs
  registerBuff(
    'set4_crit_dmg_',
    ownBuff.premod.crit_dmg_.add(
      cmpGE(relicCount, 4, ultUsed.ifOn(dm[4].crit_dmg_)),
    ),
    cmpGE(relicCount, 4, 'infer', ''),
  ),
)
export default sheet
