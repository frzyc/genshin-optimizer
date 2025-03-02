import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForRelic, registerRelic } from '../util'

const key: RelicSetKey = 'GeniusOfBrilliantStars'
const data_gen = allStats.relic[key]
const dm = mappedStats.relic[key]

const relicCount = own.common.count.sheet(key)

const { hasQuantumWeakness } = allBoolConditionals(key)

const sheet = registerRelic(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  // Conditional buffs
  registerBuff(
    'set4_defIgn_',
    ownBuff.premod.defIgn_.add(cmpGE(relicCount, 4, dm[4].defIgn_)),
    cmpGE(relicCount, 4, 'unique', '')
  ),
  registerBuff(
    'set4_addDefIgn_',
    ownBuff.premod.defIgn_.add(
      cmpGE(relicCount, 4, hasQuantumWeakness.ifOn(dm[4].addDefIgn_))
    ),
    cmpGE(relicCount, 4, 'unique', '')
  )
)
export default sheet
