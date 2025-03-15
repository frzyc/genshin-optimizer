import { cmpEq, cmpGE, prod } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import {
  allBoolConditionals,
  allNumConditionals,
  own,
  ownBuff,
  registerBuff,
} from '../../util'
import { entriesForRelic, registerRelic } from '../util'

const key: RelicSetKey = 'PioneerDiverOfDeadWaters'
const data_gen = allStats.relic[key]
const dm = mappedStats.relic[key]

const relicCount = own.common.count.sheet(key)

const { affectedByDebuff, wearerDebuff } = allBoolConditionals(key)
const { debuffCount } = allNumConditionals(
  key,
  true,
  dm[4].debuffThreshold1,
  dm[4].debuffThreshold2,
)

const sheet = registerRelic(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  // Conditional buffs
  registerBuff(
    'set2_common_dmg_',
    ownBuff.premod.common_dmg_.add(
      cmpGE(relicCount, 2, affectedByDebuff.ifOn(dm[2].dmg_)),
    ),
    cmpGE(relicCount, 2, 'infer', ''),
  ),
  registerBuff(
    'set4_crit_dmg_',
    ownBuff.premod.crit_dmg_.add(
      cmpGE(
        relicCount,
        4,
        affectedByDebuff.ifOn(
          cmpEq(
            debuffCount,
            dm[4].debuffThreshold2,
            prod(wearerDebuff.ifOn(2, 1), dm[4].crit_dmg_2),
            prod(wearerDebuff.ifOn(2, 1), dm[4].crit_dmg_1),
          ),
        ),
      ),
    ),
    cmpGE(relicCount, 4, 'infer', ''),
  ),
  registerBuff(
    'set4_crit_',
    ownBuff.premod.crit_.add(
      cmpGE(relicCount, 4, wearerDebuff.ifOn(dm[4].crit_)),
    ),
    cmpGE(relicCount, 4, 'infer', ''),
  ),
)
export default sheet
