import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allNumConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForRelic, registerRelic } from '../util'

const key: RelicSetKey = 'PrisonerInDeepConfinement'
const data_gen = allStats.relic[key]
const dm = mappedStats.relic[key]

const relicCount = own.common.count.sheet(key)

const { dotCount } = allNumConditionals(key, true, 0, dm[4].stacks)

const sheet = registerRelic(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  // Conditional buffs
  registerBuff(
    'set4_defIgn_',
    ownBuff.premod.defIgn_.add(
      cmpGE(relicCount, 4, prod(dm[4].defIgn_, dotCount))
    ),
    cmpGE(relicCount, 4, 'unique', '')
  )
)
export default sheet
