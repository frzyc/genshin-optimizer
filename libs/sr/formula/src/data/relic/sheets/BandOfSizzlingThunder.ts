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
  registerBuff,
  teamBuff,
} from '../../util'
import { entriesForRelic, registerRelic } from '../util'

const key: RelicSetKey = 'BandOfSizzlingThunder'
const data_gen = allStats.relic[key]
const dm = mappedStats.relic[key]

const relicCount = own.common.count.sheet(key)

// TODO: Add conditionals
const { boolConditional } = allBoolConditionals(key)
const { listConditional } = allListConditionals(key, ['val1', 'val2'])
const { numConditional } = allNumConditionals(key, true, 0, 2)

const sheet = registerRelic(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  // TODO: Add formulas/buffs
  // Conditional buffs
  registerBuff(
    'set2_dmg_',
    ownBuff.premod.dmg_.add(
      cmpGE(relicCount, 2, boolConditional.ifOn(dm[2].cond_dmg_))
    ),
    cmpGE(relicCount, 2, 'unique', '')
  ),
  registerBuff(
    'team_dmg_',
    teamBuff.premod.dmg_.add(cmpGE(relicCount, 4, listConditional.map({ val1: 1, val2: 2 }))),
    cmpGE(relicCount, 4, 'unique', '')
  ),
  registerBuff(
    'enemy_defIgn_',
    enemyDebuff.common.defIgn_.add(cmpGE(relicCount, 4, numConditional)),
    cmpGE(relicCount, 4, 'unique', '')
  )
)
export default sheet
