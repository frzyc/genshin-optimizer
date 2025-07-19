import { cmpGE, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allNumConditionals,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
  team,
} from '../../util'
import {
  dmgDazeAndAnomOverride,
  entriesForChar,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'Billy'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]

const { char } = own

const { ult_dmg_stacks } = allNumConditionals(key, true, 0, dm.ability.stacks)
const { distance } = allNumConditionals(
  key,
  true,
  0,
  dm.m4.exSpecial_crit_ * 100
)
const { m6_stacks } = allNumConditionals(key, true, 0, dm.m6.stacks)

const core_dmg_ = ownBuff.combat.common_dmg_.add(
  percent(subscript(char.core, dm.core.common_dmg_))
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    // Per-hit buffs
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackFullFirepower',
      2,
      { damageType1: 'basic' },
      'atk',
      undefined,
      core_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackFullFirepower',
      3,
      { damageType1: 'basic' },
      'atk',
      undefined,
      core_dmg_
    )
  ),

  // Buffs
  registerBuff('core_common_dmg_', core_dmg_, undefined, undefined, false),
  registerBuff(
    'ability_ult_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'ult',
      cmpGE(
        sum(
          team.common.count.physical,
          team.common.count.withFaction('CunningHares')
        ),
        3,
        prod(ult_dmg_stacks, percent(dm.ability.ult_dmg_))
      )
    )
  ),
  registerBuff(
    'm2_dodgeCounter_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'dodgeCounter',
      cmpGE(char.mindscape, 2, percent(dm.m2.dodgeCounter_dmg_))
    )
  ),
  registerBuff(
    'm4_exSpecial_crit_',
    ownBuff.combat.crit_.addWithDmgType(
      'exSpecial',
      cmpGE(char.mindscape, 4, prod(distance, percent(0.01)))
    )
  ),
  registerBuff(
    'm6_common_dmg_',
    ownBuff.combat.common_dmg_.add(
      cmpGE(char.mindscape, 6, prod(m6_stacks, percent(dm.m6.dmg_)))
    )
  )
)
export default sheet
