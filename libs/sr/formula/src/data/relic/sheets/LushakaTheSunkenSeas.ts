import { cmpEq, cmpGE, cmpNE } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { own, registerBuff, target, teamBuff } from '../../util'
import { entriesForRelic, registerRelic } from '../util'

const key: RelicSetKey = 'LushakaTheSunkenSeas'
const data_gen = allStats.relic[key]
const dm = mappedStats.relic[key]

const relicCount = own.common.count.sheet(key)

const sheet = registerRelic(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  // Conditional buffs
  registerBuff(
    'set2_atk_',
    teamBuff.premod.atk_.add(
      cmpGE(
        relicCount,
        2,
        cmpNE(
          own.char.teamPosition,
          1,
          cmpEq(target.char.teamPosition, 1, dm[2].atk_)
        )
      )
    ),
    cmpGE(relicCount, 2, 'infer', '')
  )
)
export default sheet
