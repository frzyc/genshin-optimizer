import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForRelic, registerRelic } from '../util'

const key: RelicSetKey = 'CelestialDifferentiator'
const data_gen = allStats.relic[key]
const dm = mappedStats.relic[key]

const relicCount = own.common.count.sheet(key)

const { firstAttack } = allBoolConditionals(key)

const sheet = registerRelic(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  // Conditional buffs
  registerBuff(
    'set2_crit_rate_',
    ownBuff.premod.crit_.add(
      cmpGE(
        relicCount,
        2,
        cmpGE(
          own.final.crit_dmg_,
          dm[2].crit_dmg_threshold,
          firstAttack.ifOn(dm[2].crit_)
        )
      )
    ),
    cmpGE(relicCount, 2, 'unique', '')
  )
)
export default sheet
