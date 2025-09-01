import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  registerBuff,
  teamBuff,
} from '../../util'
import { entriesForDisc, registerDisc } from '../util'

const key: DiscSetKey = 'DawnsBloom'

const discCount = own.common.count.sheet(key)
const showCond4Set = cmpGE(discCount, 4, 'infer', '')

// TODO: Add conditionals
const { boolConditional } = allBoolConditionals(key)
const { listConditional } = allListConditionals(key, ['val1', 'val2'])
const { numConditional } = allNumConditionals(key, true, 0, 2)

const sheet = registerDisc(
  key,
  // Handle 2-set effects
  entriesForDisc(key),

  // TODO: Add formulas/buffs
  // Conditional buffs
  registerBuff(
    'set4_dmg_',
    ownBuff.combat.common_dmg_.add(
      cmpGE(discCount, 4, boolConditional.ifOn(percent(0.1)))
    ),
    showCond4Set
  ),
  registerBuff(
    'team_dmg_',
    teamBuff.combat.common_dmg_.add(listConditional.map({ val1: 1, val2: 2 })),
    showCond4Set
  ),
  registerBuff(
    'enemy_defIgn_',
    enemyDebuff.common.dmgRed_.add(numConditional),
    showCond4Set
  )
)
export default sheet
