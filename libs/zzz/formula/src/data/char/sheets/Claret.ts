import {
  cmpEq,
  cmpGE,
  constant,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
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
  getBaseTag,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'Claret'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { crimsonInscription, perfectDodge, remnantEdge } =
  allBoolConditionals(key)

const core_basic_dmg_ = ownBuff.combat.dmg_.addWithDmgType(
  'basic',
  perfectDodge.ifOn(percent(dm.core.dmg_))
)
const m4_basic_dmg_ = ownBuff.combat.dmg_.addWithDmgType(
  'basic',
  cmpGE(char.mindscape, 4, percent(dm.m4.dmg_))
)
const m4_chain_dmg_ = ownBuff.combat.dmg_.addWithDmgType(
  'chain',
  cmpGE(char.mindscape, 4, percent(dm.m4.dmg_))
)
const m4_ult_dmg_ = ownBuff.combat.dmg_.addWithDmgType(
  'ult',
  cmpGE(char.mindscape, 4, percent(dm.m4.dmg_))
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackBloodbloomOathStarforging',
      2,
      { ...baseTag, damageType1: 'basic', skillType: 'basicSkill' },
      'def',
      undefined,
      ...core_basic_dmg_,
      ...m4_basic_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackBloodbloomOathStarforging',
      3,
      { ...baseTag, damageType1: 'basic', skillType: 'basicSkill' },
      'def',
      undefined,
      ...core_basic_dmg_,
      ...m4_basic_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackBloodbloomOathSubduingAxe',
      0,
      { ...baseTag, damageType1: 'basic', skillType: 'basicSkill' },
      'def',
      undefined,
      ...core_basic_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'SpecialAttackBloodbloomOathCleavingGoldAndIron',
      2,
      {
        ...baseTag,
        damageType1: 'maim',
        skillType: 'specialSkill',
      },
      'def'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'chain',
      'ChainAttackBloodbloomOathResonantBloodPact',
      0,
      { ...baseTag, damageType1: 'chain', skillType: 'chainSkill' },
      'def',
      undefined,
      ...m4_chain_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'chain',
      'UltimateBloodbloomOathTrialAfterTrial',
      0,
      { ...baseTag, damageType1: 'ult', skillType: 'chainSkill' },
      'def',
      undefined,
      ...m4_ult_dmg_
    )
  ),

  // Buffs
  registerBuff(
    'core_initial_crit_',
    ownBuff.initial.crit_.add(
      prod(own.initial.crit_dmg_, constant(100), percent(dm.core.initial_crit_))
    )
  ),
  registerBuff(
    'core_crit_',
    ownBuff.combat.crit_.add(
      crimsonInscription.ifOn(percent(subscript(char.core, dm.core.crit_)))
    )
  ),
  registerBuff('core_basic_dmg_', core_basic_dmg_, undefined, false, false),
  registerBuff(
    'ability_laceration_dmg_',
    teamBuff.combat.laceration_dmg_.add(
      cmpGE(
        sum(
          team.common.count.withSpecialty('stun'),
          team.common.count.withSpecialty('armorer'),
          team.common.count.electric
        ),
        3,
        remnantEdge.ifOn(
          cmpEq(char.specialty, 'armorer', percent(dm.ability.laceration_dmg_))
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'm1_maim_mult_',
    ownBuff.dmg.mv_mult_.addWithDmgType(
      'maim',
      cmpGE(char.mindscape, 1, percent(dm.m1.maim_mult_))
    )
  ),
  registerBuff(
    'm2_electric_resIgn_',
    ownBuff.combat.resIgn_.electric.add(
      cmpGE(
        char.mindscape,
        2,
        crimsonInscription.ifOn(percent(dm.m2.electric_resIgn_))
      )
    )
  ),
  registerBuff('m4_basic_dmg_', m4_basic_dmg_, undefined, false, false),
  registerBuff('m4_chain_dmg_', m4_chain_dmg_, undefined, false, false),
  registerBuff('m4_ult_dmg_', m4_ult_dmg_, undefined, false, false)
)
export default sheet
