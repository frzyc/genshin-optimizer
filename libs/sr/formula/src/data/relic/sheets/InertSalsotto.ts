import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { own, ownBuff, registerBuff } from '../../util'
import { entriesForRelic, registerRelic } from '../util'

const key: RelicSetKey = 'InertSalsotto'
const data_gen = allStats.relic[key]
const dm = mappedStats.relic[key]

const relicCount = own.common.count.sheet(key)

const sheet = registerRelic(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  // Conditional buffs
  registerBuff(
    'set2_ult_dmg_',
    ownBuff.premod.dmg_.addWithDmgType(
      'ult',
      cmpGE(
        relicCount,
        2,
        cmpGE(own.final.crit_, dm[2].crit_threshold, dm[2].ult_and_followUp_),
      ),
    ),
    cmpGE(relicCount, 2, 'infer', ''),
  ),
  registerBuff(
    'set2_followUp_dmg_',
    ownBuff.premod.dmg_.addWithDmgType(
      'followUp',
      cmpGE(
        relicCount,
        2,
        cmpGE(own.final.crit_, dm[2].crit_threshold, dm[2].ult_and_followUp_),
      ),
    ),
    cmpGE(relicCount, 2, 'infer', ''),
  ),
)
export default sheet
