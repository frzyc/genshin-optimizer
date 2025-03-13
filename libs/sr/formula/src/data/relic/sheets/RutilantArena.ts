import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { own, ownBuff, registerBuff } from '../../util'
import { entriesForRelic, registerRelic } from '../util'

const key: RelicSetKey = 'RutilantArena'
const data_gen = allStats.relic[key]
const dm = mappedStats.relic[key]

const relicCount = own.common.count.sheet(key)

const sheet = registerRelic(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  // Conditional buffs
  registerBuff(
    'set4_basic_dmg_',
    ownBuff.premod.dmg_.addWithDmgType(
      'basic',
      cmpGE(
        relicCount,
        4,
        cmpGE(own.final.crit_, dm[2].crit_threshold, dm[2].basic_and_skill_dmg_)
      )
    ),
    cmpGE(relicCount, 4, 'infer', '')
  ),
  registerBuff(
    'set4_skill_dmg_',
    ownBuff.premod.dmg_.addWithDmgType(
      'skill',
      cmpGE(
        relicCount,
        4,
        cmpGE(own.final.crit_, dm[2].crit_threshold, dm[2].basic_and_skill_dmg_)
      )
    ),
    cmpGE(relicCount, 4, 'infer', '')
  )
)
export default sheet
