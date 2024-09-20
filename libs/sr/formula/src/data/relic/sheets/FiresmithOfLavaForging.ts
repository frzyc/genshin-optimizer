import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  enemyDebuff,
  own,
  ownBuff,
  register,
  registerBuff,
  teamBuff,
} from '../../util'
import { entriesForRelic } from '../util'

const key: RelicSetKey = 'FiresmithOfLavaForging'
const data_gen = allStats.relic[key]
const dm = mappedStats.relic[key]

const relicCount = own.common.count.sheet(key)

// TODO: Add conditionals
const { boolConditional } = allBoolConditionals(key)
const { listConditional } = allListConditionals(key, ['val1', 'val2'])
const { numConditional } = allNumConditionals(key, true, 0, 2)

const sheet = register(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  // TODO: Add formulas/buffs
  // Conditional buffs
  registerBuff(
    'set2_dmg_',
    ownBuff.premod.dmg_.add(
      boolConditional.ifOn(cmpGE(relicCount, 2, dm[2].cond_dmg_))
    )
  ),
  registerBuff(
    'team_dmg_',
    teamBuff.premod.dmg_.add(listConditional.map({ val1: 1, val2: 2 }))
  ),
  registerBuff('enemy_defIgn_', enemyDebuff.common.defIgn_.add(numConditional))
)
export default sheet
