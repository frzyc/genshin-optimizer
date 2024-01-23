import { cmpGE, prod } from '@genshin-optimizer/pando'
import type { RelicSetKey } from '@genshin-optimizer/sr-consts'
import { allStats } from '@genshin-optimizer/sr-stats'
import { allNumConditionals, enemyDebuff, register, self } from '../util'
import { entriesForRelic } from './util'

const key: RelicSetKey = 'PrisonerInDeepConfinement'
const data_gen = allStats.relic[key]

const dm = {
  2: {
    passiveDmg: data_gen.setEffects[0].otherStats[0],
  },
  4: {
    defIgn_: data_gen.setEffects[1].otherStats[0],
    numStacks: data_gen.setEffects[1].otherStats[1],
  },
}

const relicCount = self.common.count.src(key)

const { stackCount } = allNumConditionals(key, 'sum', true, 0, dm[4].numStacks)

const sheet = register(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  // Conditional buffs
  enemyDebuff.common.defIgn_.add(
    cmpGE(relicCount, 4, prod(dm[4].defIgn_, stackCount))
  )
)
export default sheet
