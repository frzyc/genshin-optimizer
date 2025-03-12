import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { own, ownBuff, registerBuff } from '../../util'
import { entriesForRelic, registerRelic } from '../util'

const key: RelicSetKey = 'TaliaKingdomOfBanditry'
const data_gen = allStats.relic[key]
const dm = mappedStats.relic[key]

const relicCount = own.common.count.sheet(key)

const sheet = registerRelic(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  // Conditional buffs
  registerBuff(
    'set2_brEffect_',
    ownBuff.premod.brEffect_.add(
      cmpGE(
        relicCount,
        2,
        cmpGE(own.final.spd, dm[2].spdThreshold, dm[2].brEffect_)
      )
    ),
    cmpGE(relicCount, 2, 'infer', '')
  )
)
export default sheet
