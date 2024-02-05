import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '@genshin-optimizer/sr/stats'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  enemyDebuff,
  register,
  self,
  selfBuff,
  teamBuff,
} from '../util'
import { entriesForRelic } from './util'

const key: RelicSetKey = 'PanGalacticCommercialEnterprise'
const data_gen = allStats.relic[key]

let t = 0,
  f = 0
// TODO: Load scalings
const dm = {
  2: {
    dmg: data_gen.setEffects[0].otherStats[t++] ?? 1,
  },
  4: {
    dmg: data_gen.setEffects[1].otherStats[f++] ?? 1,
  },
}

const relicCount = self.common.count.src(key)

// TODO: Add conditionals
const { boolConditional } = allBoolConditionals(key)
const { listConditional } = allListConditionals(key, ['val1', 'val2'])
const { numConditional } = allNumConditionals(key, 'sum', true, 0, 2)

const sheet = register(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  // TODO: Add formulas/buffs
  // Conditional buffs
  selfBuff.premod.dmg_.add(
    boolConditional.ifOn(cmpGE(relicCount, 4, dm[4].dmg))
  ),
  teamBuff.premod.dmg_.add(listConditional.map({ val1: 1, val2: 2 })),
  enemyDebuff.common.defIgn_.add(numConditional)
)
export default sheet
