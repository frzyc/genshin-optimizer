import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { enemyDebuff, own, registerBuff } from '../../util'
import { entriesForRelic, registerRelic } from '../util'

const key: RelicSetKey = 'IronCavalryAgainstTheScourge'
const data_gen = allStats.relic[key]
const dm = mappedStats.relic[key]

const relicCount = own.common.count.sheet(key)

const sheet = registerRelic(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  // Conditional buffs
  registerBuff(
    'set4_break_defIgn_',
    enemyDebuff.common.defIgn_.addWithDmgType(
      'break',
      cmpGE(
        relicCount,
        4,
        cmpGE(
          own.final.brEffect_,
          dm[4].brEffect_threshold1,
          dm[4].break_defIgn_
        )
      )
    ),
    cmpGE(relicCount, 4, 'unique', '')
  ),
  registerBuff(
    'set4_superBreak_defIgn_',
    enemyDebuff.common.defIgn_.addWithDmgType(
      'break',
      cmpGE(
        relicCount,
        4,
        cmpGE(
          own.final.brEffect_,
          dm[4].brEffect_threshold2,
          dm[4].superBreak_defIgn_
        )
      )
    ),
    cmpGE(relicCount, 4, 'unique', '')
  )
)
export default sheet
