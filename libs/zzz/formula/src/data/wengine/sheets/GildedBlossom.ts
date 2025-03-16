import { subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
import { getWengineParams } from '@genshin-optimizer/zzz/stats'
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
import {
  cmpSpecialtyAndEquipped,
  entriesForWengine,
  registerWengine,
  showSpecialtyAndEquipped,
} from '../util'

const key: WengineKey = 'GildedBlossom'
const { modification } = own.wengine
const params = getWengineParams(key)

// TODO: Add conditionals
const { boolConditional } = allBoolConditionals(key)
const { listConditional } = allListConditionals(key, ['val1', 'val2'])
const { numConditional } = allNumConditionals(key, true, 0, 2)

const sheet = registerWengine(
  key,
  // Handles base stats and passive buffs
  entriesForWengine(key),

  // TODO: Add formulas/buffs
  // Conditional buffs
  registerBuff(
    'cond_dmg_',
    ownBuff.combat.common_dmg_.add(
      cmpSpecialtyAndEquipped(
        key,
        boolConditional.ifOn(subscript(modification, params[0]))
      )
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'team_dmg_',
    teamBuff.combat.common_dmg_.add(
      cmpSpecialtyAndEquipped(key, listConditional.map({ val1: 1, val2: 2 }))
    ),
    showSpecialtyAndEquipped(key)
  ),
  registerBuff(
    'enemy_defIgn_',
    enemyDebuff.common.dmgRed_.add(
      cmpSpecialtyAndEquipped(key, numConditional)
    ),
    showSpecialtyAndEquipped(key)
  )
)
export default sheet
