import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { own, registerBuff, teamBuff } from '../../util'
import { entriesForRelic, registerRelic } from '../util'

const key: RelicSetKey = 'BrokenKeel'
const data_gen = allStats.relic[key]
const dm = mappedStats.relic[key]

const relicCount = own.common.count.sheet(key)

const sheet = registerRelic(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  // Conditional buffs
  registerBuff(
    'set2_crit_dmg_',
    teamBuff.premod.crit_dmg_.add(
      cmpGE(
        relicCount,
        2,
        cmpGE(own.final.eff_res_, dm[2].eff_res_threshold, dm[2].team_crit_dmg_)
      )
    ),
    cmpGE(relicCount, 2, 'infer', '')
  )
)
export default sheet
