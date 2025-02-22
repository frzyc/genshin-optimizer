import { cmpGE, subscript } from '@genshin-optimizer/pando/engine'
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
import { entriesForWengine, registerWengine } from '../util'

const key: WengineKey = 'Housekeeper'
const weCount = own.common.count.sheet(key)
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
      cmpGE(
        weCount,
        1,
        boolConditional.ifOn(subscript(modification, [0.1, 0.2, 0.3, 0.4, 0.5]))
      )
    )
  ),
  registerBuff(
    'team_dmg_',
    teamBuff.combat.common_dmg_.add(
      cmpGE(weCount, 1, listConditional.map({ val1: 1, val2: 2 }))
    )
  ),
  registerBuff(
    'enemy_defIgn_',
    enemyDebuff.common.dmgRed_.add(cmpGE(weCount, 1, numConditional))
  )
)
export default sheet
