import { cmpEq, cmpGE, prod } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allNumConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForRelic, registerRelic } from '../util'

const key: RelicSetKey = 'DuranDynastyOfRunningWolves'
const data_gen = allStats.relic[key]
const dm = mappedStats.relic[key]

const relicCount = own.common.count.sheet(key)

const { merit } = allNumConditionals(key, true, 0, dm[2].stacks)

const sheet = registerRelic(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  // Conditional buffs
  registerBuff(
    'set2_followUp_dmg_',
    ownBuff.premod.dmg_.addWithDmgType(
      'followUp',
      cmpGE(relicCount, 2, prod(dm[2].followUp_, merit))
    ),
    cmpGE(relicCount, 2, 'infer', '')
  ),
  registerBuff(
    'set2_crit_dmg_',
    ownBuff.premod.crit_dmg_.add(
      cmpGE(relicCount, 2, cmpEq(merit, 5, dm[2].crit_dmg_))
    ),
    cmpGE(relicCount, 2, 'infer', '')
  )
)
export default sheet
