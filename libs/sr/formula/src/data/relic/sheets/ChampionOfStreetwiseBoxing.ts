import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allNumConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForRelic, registerRelic } from '../util'

const key: RelicSetKey = 'ChampionOfStreetwiseBoxing'
const data_gen = allStats.relic[key]
const dm = mappedStats.relic[key]

const relicCount = own.common.count.sheet(key)

const { hits } = allNumConditionals(key, true, 0, dm[4].stacks)

const sheet = registerRelic(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  // Conditional buffs
  registerBuff(
    'set4_atk_',
    ownBuff.premod.atk_.add(cmpGE(relicCount, 4, prod(hits, dm[4].atk_))),
    cmpGE(relicCount, 4, 'infer', '')
  )
)
export default sheet
