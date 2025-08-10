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
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
  team,
  teamBuff,
} from '../../util'
import {
  dmgDazeAndAnomOverride,
  entriesForChar,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'Rina'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]

const { char } = own

const {
  minions_onField,
  shocked_enemy,
  within_10m,
  active_char,
  exSpecial_chain_ult_hit,
} = allBoolConditionals(key)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    // Basic whack the dimwit hits 1-2 are physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackWhackTheDimwit',
      0,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackWhackTheDimwit',
      1,
      { damageType1: 'basic' },
      'atk'
    ),
    // Dash attack is physical
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackSuddenSurprise',
      0,
      { damageType1: 'dash' },
      'atk'
    )
  ),

  // Buffs
  registerBuff(
    'core_pen_',
    notOwnBuff.final.pen_.add(
      minions_onField.ifOn(
        min(
          prod(
            cmpGE(
              char.mindscape,
              1,
              within_10m.ifOn(percent(dm.m1.core_buff_), percent(1)),
              percent(1)
            ),
            percent(dm.core.max_pen_)
          ),
          prod(
            cmpGE(
              char.mindscape,
              1,
              within_10m.ifOn(percent(dm.m1.core_buff_), percent(1)),
              percent(1)
            ),
            sum(
              prod(own.final.pen_, percent(dm.core.pen_scaling)),
              percent(subscript(char.core, dm.core.pen_))
            )
          )
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'ability_electric_dmg_',
    teamBuff.combat.dmg_.electric.add(
      cmpGE(
        sum(
          team.common.count.electric,
          team.common.count.withFaction('VictoriaHousekeepingCo')
        ),
        3,
        shocked_enemy.ifOn(percent(dm.ability.electric_dmg_))
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'm2_common_dmg_',
    ownBuff.combat.common_dmg_.add(
      cmpGE(char.mindscape, 2, active_char.ifOn(percent(dm.m2.common_dmg_)))
    )
  ),
  registerBuff(
    'm4_enerRegen',
    ownBuff.combat.enerRegen.add(
      cmpGE(char.mindscape, 4, minions_onField.ifOn(percent(dm.m4.enerRegen)))
    )
  ),
  registerBuff(
    'm6_electric_dmg_',
    teamBuff.combat.dmg_.electric.add(
      cmpGE(
        char.mindscape,
        6,
        exSpecial_chain_ult_hit.ifOn(percent(dm.m6.electric_dmg_))
      )
    ),
    undefined,
    true
  )
)
export default sheet
