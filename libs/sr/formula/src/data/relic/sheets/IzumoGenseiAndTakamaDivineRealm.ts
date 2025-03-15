import { cmpEq, cmpGE, sum } from '@genshin-optimizer/pando/engine'
import { allPathKeys, type RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { own, ownBuff, registerBuff, team } from '../../util'
import { entriesForRelic, registerRelic } from '../util'

const key: RelicSetKey = 'IzumoGenseiAndTakamaDivineRealm'
const data_gen = allStats.relic[key]
const dm = mappedStats.relic[key]

const relicCount = own.common.count.sheet(key)

const sheet = registerRelic(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  // Conditional buffs
  registerBuff(
    'set2_crit_',
    ownBuff.premod.crit_.add(
      cmpGE(
        relicCount,
        2,
        cmpGE(
          sum(
            ...allPathKeys.map((path) =>
              cmpEq(own.char.path, path, team.common.count.withPath(path)),
            ),
          ),
          1,
          dm[2].crit_,
        ),
      ),
    ),
    cmpGE(relicCount, 2, 'infer', ''),
  ),
)
export default sheet
