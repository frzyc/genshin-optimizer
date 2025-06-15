import {
  cmpGE,
  min,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  customHeal,
  enemyDebuff,
  notOwnBuff,
  own,
  percent,
  register,
  registerBuff,
} from '../../util'
import { entriesForChar, registerAllDmgDazeAndAnom } from '../util'

const key: CharacterKey = 'PanYinhu'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]

const { char } = own

const { meridian_flow, depleted_qi } = allBoolConditionals(key)

const sheet = register(
  key,
  // Handles base stats, StatBoosts and Eidolon 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(key, dm),

  customHeal(
    'ultimate_heal',
    prod(
      sum(100, prod(char.chain, 60)),
      sum(percent(1), cmpGE(char.mindscape, 4, percent(dm.m4.heal_)))
    )
  ),
  customHeal(
    'ultimate_healOverTime',
    prod(
      sum(0.8, prod(char.chain, 0.05)),
      sum(percent(1), cmpGE(char.mindscape, 4, percent(dm.m4.heal_dot_)))
    )
  ),
  customHeal(
    'm4_heal',
    cmpGE(
      char.mindscape,
      4,
      prod(
        sum(100, prod(char.chain, 60)),
        sum(percent(1), percent(dm.m4.heal_)),
        percent(dm.m4.heal)
      )
    )
  ),

  // Buffs
  registerBuff(
    'core_sheerForce',
    notOwnBuff.combat.sheerForce.add(
      meridian_flow.ifOn(
        min(
          cmpGE(
            char.mindscape,
            6,
            dm.m6.max_sheerForce,
            dm.core.max_sheerForce
          ),
          prod(
            own.final.atk,
            sum(
              percent(subscript(char.core, dm.core.sheerForce)),
              cmpGE(char.mindscape, 6, percent(dm.m6.sheerForce))
            )
          )
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'ability_dmgInc_',
    enemyDebuff.common.dmgInc_.add(depleted_qi.ifOn(dm.ability.dmgInc_))
  ),
  registerBuff(
    'm1_dmgInc_',
    enemyDebuff.common.dmgInc_.add(
      cmpGE(char.mindscape, 1, depleted_qi.ifOn(dm.m1.dmgInc_))
    )
  )
)
export default sheet
