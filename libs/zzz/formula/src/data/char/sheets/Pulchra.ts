import type { NumNode } from '@genshin-optimizer/pando/engine'
import { cmpGE, cmpLT, subscript, sum } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
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

const key: CharacterKey = 'Pulchra'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]

const { char } = own

const { hunters_gait, binding_trap } = allBoolConditionals(key)

const abilityCheck = (node: NumNode | number) =>
  cmpGE(
    sum(
      team.common.count.withSpecialty('attack'),
      team.common.count.withSpecialty('rupture'),
      team.common.count.withFaction('SonsOfCalydon')
    ),
    1,
    node
  )

const m6_special_dmg_ = ownBuff.combat.dmg_.addWithDmgType(
  'special',
  cmpGE(char.mindscape, 6, percent(dm.m6.dmg_))
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    // Special Rending Claw - Nightmare Shadow is aftershock
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'SpecialAttackRendingClawNightmareShadow',
      0,
      { damageType1: 'special', damageType2: 'aftershock' },
      'atk',
      undefined,
      ...m6_special_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'SpecialAttackRendingClawNightmareShadow',
      1,
      { damageType1: 'special', damageType2: 'aftershock' },
      'atk',
      undefined,
      ...m6_special_dmg_
    )
  ),

  // Buffs
  registerBuff(
    'core_dazeInc_',
    ownBuff.combat.dazeInc_.add(
      hunters_gait.ifOn(percent(subscript(char.core, dm.core.dazeInc_)))
    )
  ),
  registerBuff(
    'ability_aftershock_dmg_',
    teamBuff.combat.dmg_.addWithDmgType(
      'aftershock',
      cmpLT(
        char.mindscape,
        6,
        abilityCheck(binding_trap.ifOn(percent(dm.ability.aftershock_dmg_)))
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'm1_crit_',
    ownBuff.combat.crit_.add(
      cmpGE(
        char.mindscape,
        1,
        abilityCheck(binding_trap.ifOn(percent(dm.m1.crit_)))
      )
    )
  ),
  registerBuff(
    'm2_atk_',
    ownBuff.combat.atk_.add(
      cmpGE(char.mindscape, 2, hunters_gait.ifOn(percent(dm.m2.atk_)))
    )
  ),
  registerBuff('m6_special_dmg_', m6_special_dmg_, undefined, undefined, false),
  registerBuff(
    'm6_common_dmg_',
    teamBuff.combat.common_dmg_.add(
      cmpGE(
        char.mindscape,
        6,
        abilityCheck(percent(dm.ability.aftershock_dmg_))
      )
    ),
    undefined,
    true
  )
)
export default sheet
