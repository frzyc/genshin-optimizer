import { subscript } from '@genshin-optimizer/pando/engine'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'
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
  cmpSpecialtyCount,
  entriesForWengine,
  registerWengine,
  showSpecialtyCount,
} from '../util'

const key: WengineKey = 'UnfetteredGameBall'
const { modification } = own.wengine

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
      cmpSpecialtyCount(
        key,
        boolConditional.ifOn(subscript(modification, [0.1, 0.2, 0.3, 0.4, 0.5]))
      )
    ),
    showSpecialtyCount(key)
  ),
  registerBuff(
    'team_dmg_',
    teamBuff.combat.common_dmg_.add(
      cmpSpecialtyCount(key, listConditional.map({ val1: 1, val2: 2 }))
    ),
    showSpecialtyCount(key)
  ),
  registerBuff(
    'enemy_defIgn_',
    enemyDebuff.common.dmgRed_.add(cmpSpecialtyCount(key, numConditional)),
    showSpecialtyCount(key)
  )
)
export default sheet
