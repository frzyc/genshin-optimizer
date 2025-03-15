import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allBoolConditionals, own, registerBuff, teamBuff } from '../../util'
import { entriesForRelic, registerRelic } from '../util'

const key: RelicSetKey = 'WatchmakerMasterOfDreamMachinations'
const data_gen = allStats.relic[key]
const dm = mappedStats.relic[key]

const relicCount = own.common.count.sheet(key)

const { useUltimateOnAlly } = allBoolConditionals(key)

const sheet = registerRelic(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  registerBuff(
    'set4_brEffect_',
    teamBuff.premod.brEffect_.add(
      cmpGE(relicCount, 4, useUltimateOnAlly.ifOn(dm[4].brEffect_)),
    ),
    cmpGE(relicCount, 4, 'infer', ''),
  ),
)
export default sheet
