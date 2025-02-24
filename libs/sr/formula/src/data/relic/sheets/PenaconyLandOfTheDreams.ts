import { cmpEq, cmpGE } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { notOwnBuff, own, registerBuff, target } from '../../util'
import { entriesForRelic, registerRelic } from '../util'

const key: RelicSetKey = 'PenaconyLandOfTheDreams'
const data_gen = allStats.relic[key]
const dm = mappedStats.relic[key]

const relicCount = own.common.count.sheet(key)

const sheet = registerRelic(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  // Conditional buffs
  registerBuff(
    'set2_common_dmg_',
    notOwnBuff.premod.common_dmg_.add(
      cmpGE(
        relicCount,
        2,
        cmpEq(own.char.ele, target.char.ele, dm[2].common_dmg_)
      )
    ),
    cmpGE(relicCount, 2, 'unique', '')
  )
)
export default sheet
