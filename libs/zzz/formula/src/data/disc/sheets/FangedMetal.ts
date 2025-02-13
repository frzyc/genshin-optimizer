import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
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
import { registerDisc } from '../util'

const key: DiscSetKey = 'FangedMetal'

const discCount = own.common.count.sheet(key)

// TODO: Add conditionals
const { boolConditional } = allBoolConditionals(key)
const { listConditional } = allListConditionals(key, ['val1', 'val2'])
const { numConditional } = allNumConditionals(key, true, 0, 2)

const sheet = registerDisc(
  key,

  // TODO: Add formulas/buffs
  // Conditional buffs
  registerBuff(
    'set2_dmg_',
    ownBuff.combat.dmg_.add(
      boolConditional.ifOn(cmpGE(discCount, 2, 0.1))
    )
  ),
  registerBuff(
    'team_dmg_',
    teamBuff.combat.dmg_.add(listConditional.map({ val1: 1, val2: 2 }))
  ),
  registerBuff('enemy_defIgn_', enemyDebuff.common.dmgRed_.add(numConditional))
)
export default sheet
