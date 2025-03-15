import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { own, ownBuff, registerBuff } from '../../util'
import { entriesForRelic, registerRelic } from '../util'

const key: RelicSetKey = 'KnightOfPurityPalace'
const data_gen = allStats.relic[key]
const dm = mappedStats.relic[key]

const relicCount = own.common.count.sheet(key)

const sheet = registerRelic(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  registerBuff(
    'set4_shield_',
    ownBuff.premod.shield_.add(cmpGE(relicCount, 4, dm[4].shield_)),
    cmpGE(relicCount, 4, 'infer', '')
  )
)
export default sheet
