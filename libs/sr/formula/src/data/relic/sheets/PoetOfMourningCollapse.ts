import { cmpGE, cmpLT } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { own, registerBuff, teamBuff } from '../../util'
import { entriesForRelic, registerRelic } from '../util'

const key: RelicSetKey = 'PoetOfMourningCollapse'
const data_gen = allStats.relic[key]
const dm = mappedStats.relic[key]

const relicCount = own.common.count.sheet(key)

const sheet = registerRelic(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  // Conditional buffs
  registerBuff(
    'set4_crit_',
    teamBuff.premod.crit_.add(
      cmpGE(
        relicCount,
        4,
        cmpLT(
          own.final.spd,
          dm[4].spd_threshold2,
          dm[4].crit_2,
          cmpLT(own.final.spd, dm[4].spd_threshold1, dm[4].crit_1)
        )
      )
    ),
    cmpGE(relicCount, 4, 'infer', '')
  )
)
export default sheet
