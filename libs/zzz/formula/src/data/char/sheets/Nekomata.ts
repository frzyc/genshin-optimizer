import { cmpGE, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  allNumConditionals,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
  team,
} from '../../util'
import { entriesForChar, registerAllDmgDazeAndAnom } from '../util'

const key: CharacterKey = 'Nekomata'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]

const { char } = own

const { dodgeCounter_quickAssist_hit, from_behind, one_enemy_onField } =
  allBoolConditionals(key)
const { assaults_inflicted } = allNumConditionals(
  key,
  true,
  0,
  dm.ability.stacks
)
const { exSpecials_used } = allNumConditionals(key, true, 0, dm.m4.stacks)
const { chain_ult_used } = allNumConditionals(key, true, 0, dm.m6.stacks)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(key, dm),

  // Buffs
  registerBuff(
    'core_common_dmg_',
    ownBuff.combat.common_dmg_.add(
      dodgeCounter_quickAssist_hit.ifOn(
        percent(subscript(char.core, dm.core.common_dmg_))
      )
    )
  ),
  registerBuff(
    'ability_exSpecial_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'exSpecial',
      cmpGE(
        sum(
          team.common.count.physical,
          team.common.count.withFaction('CunningHares')
        ),
        3,
        prod(assaults_inflicted, percent(dm.ability.exSpecial_dmg_))
      )
    )
  ),
  registerBuff(
    'm1_physical_resIgn_',
    ownBuff.combat.resIgn_.physical.add(
      cmpGE(
        char.mindscape,
        1,
        from_behind.ifOn(percent(dm.m1.physical_resIgn_))
      )
    )
  ),
  registerBuff(
    'm2_enerRegen_',
    ownBuff.combat.enerRegen_.add(
      cmpGE(
        char.mindscape,
        2,
        one_enemy_onField.ifOn(percent(dm.m2.enerRegen_))
      )
    )
  ),
  registerBuff(
    'm4_crit_',
    ownBuff.combat.crit_.add(
      cmpGE(char.mindscape, 4, prod(exSpecials_used, percent(dm.m4.crit_)))
    )
  ),
  registerBuff(
    'm6_crit_dmg_',
    ownBuff.combat.crit_dmg_.add(
      cmpGE(char.mindscape, 6, prod(chain_ult_used, percent(dm.m6.crit_dmg_)))
    )
  )
)
export default sheet
