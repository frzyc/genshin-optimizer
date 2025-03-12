import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { own, ownBuff, registerBuff } from '../../util'
import { entriesForRelic, registerRelic } from '../util'

const key: RelicSetKey = 'BoneCollectionsSereneDemesne'
const data_gen = allStats.relic[key]
const dm = mappedStats.relic[key]

const relicCount = own.common.count.sheet(key)

const sheet = registerRelic(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  // Conditional buffs
  registerBuff(
    'set2_crit_dmg_',
    ownBuff.premod.crit_dmg_.add(
      cmpGE(
        relicCount,
        2,
        cmpGE(own.final.hp, dm[2].hpThreshold, dm[2].crit_dmg_)
      )
    ),
    cmpGE(relicCount, 2, 'unique', '')
  )
  // TODO: Add memosprite buff
)
export default sheet
