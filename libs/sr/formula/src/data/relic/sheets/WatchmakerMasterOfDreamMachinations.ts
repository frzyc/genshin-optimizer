import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import {
  allBoolConditionals,
  own,
  register,
  registerBuff,
  teamBuff,
} from '../../util'
import { entriesForRelic } from '../util'

const key: RelicSetKey = 'WatchmakerMasterOfDreamMachinations'
const data_gen = allStats.relic[key]
const dm = mappedStats.relic[key]

const relicCount = own.common.count.sheet(key)

const { useUltimateOnAlly } = allBoolConditionals(key)

const sheet = register(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  registerBuff(
    'set4_brEffect_',
    teamBuff.premod.brEffect_.add(
      useUltimateOnAlly.ifOn(cmpGE(relicCount, 4, dm[4].brEffect_))
    )
  )
)
export default sheet
