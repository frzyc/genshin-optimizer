import { cmpGE, prod } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '@genshin-optimizer/sr/stats'
import { allNumConditionals, enemyDebuff, own, register } from '../util'
import { entriesForRelic } from './util'

const key: RelicSetKey = 'PrisonerInDeepConfinement'
const data_gen = allStats.relic[key]

let t = 0,
  f = 0
const dm = {
  2: {
    passiveDmg: data_gen.setEffects[0].otherStats[t++],
  },
  4: {
    defIgn_: data_gen.setEffects[1].otherStats[f++],
    numStacks: data_gen.setEffects[1].otherStats[f++],
  },
}

const relicCount = own.common.count.sheet(key)

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
