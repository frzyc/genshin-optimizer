import { cmpGE, min, prod } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { own, ownBuff, registerBuff } from '../../util'
import { entriesForRelic, registerRelic } from '../util'

const key: RelicSetKey = 'PanCosmicCommercialEnterprise'
const data_gen = allStats.relic[key]
const dm = mappedStats.relic[key]

const relicCount = own.common.count.sheet(key)

const sheet = registerRelic(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  // Conditional buffs
  registerBuff(
    'set2_dmg_',
    ownBuff.premod.atk_.add(
      cmpGE(
        relicCount,
        2,
        min(prod(dm[2].scaling, own.final.eff_), dm[2].atk_cap),
      ),
    ),
    cmpGE(relicCount, 2, 'infer', ''),
  ),
)
export default sheet
