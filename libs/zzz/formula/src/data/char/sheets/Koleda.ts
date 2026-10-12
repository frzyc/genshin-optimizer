import {
  cmpEq,
  cmpGE,
  cmpNE,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import { isStunned } from '../../common/enemy'
import {
  allBoolConditionals,
  allNumConditionals,
  customDmg,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
  target,
  team,
  teamBuff,
} from '../../util'
import {
  dmgDazeAndAnomOverride,
  entriesForChar,
  getBaseTag,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'Koleda'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { quick_use } = allBoolConditionals(key)
const { exSpecial_debuff } = allNumConditionals(key, true, 0, dm.ability.stacks)
const { charge } = allNumConditionals(key, true, 0, dm.m4.stacks)
const { furnaceFire } = allNumConditionals(key, true, 0, 2)

const core_dazeInc_ = ownBuff.combat.dazeInc_.add(
  percent(subscript(char.core, dm.core.dazeInc_))
)
const basic_dmg_ = ownBuff.combat.dmg_.addWithDmgType(
  'basic',
  cmpGE(char.potential, 1, prod(furnaceFire, percent(0.1)))
)
const basic_dazeInc_ = ownBuff.combat.dazeInc_.addWithDmgType(
  'basic',
  cmpGE(char.potential, 1, prod(furnaceFire, percent(0.2)))
)
const exSpecial_dazeInc_ = ownBuff.combat.dazeInc_.addWithDmgType(
  'exSpecial',
  cmpGE(char.potential, 1, percent(0.1))
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    // Basic Attack 1-4 hits are physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackSmashNBash',
      0,
      { damageType1: 'basic', skillType: 'basicSkill' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackSmashNBash',
      1,
      { damageType1: 'basic', skillType: 'basicSkill' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackSmashNBash',
      2,
      { damageType1: 'basic', skillType: 'basicSkill' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackSmashNBash',
      3,
      { damageType1: 'basic', skillType: 'basicSkill' },
      'atk'
    ),
    // Dash Attack is physical
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackTremble',
      0,
      { damageType1: 'dash', skillType: 'dodgeSkill' },
      'atk'
    ),
    // Per-hit buffs
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackSmashNBash',
      4,
      { ...baseTag, damageType1: 'basic', skillType: 'basicSkill' },
      'atk',
      undefined,
      core_dazeInc_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackSmashNBash',
      5,
      { ...baseTag, damageType1: 'basic', skillType: 'basicSkill' },
      'atk',
      undefined,
      core_dazeInc_,
      ...basic_dmg_,
      ...basic_dazeInc_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackSmashNBash',
      6,
      { ...baseTag, damageType1: 'basic', skillType: 'basicSkill' },
      'atk',
      undefined,
      core_dazeInc_,
      ...basic_dmg_,
      ...basic_dazeInc_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'EXSpecialAttackBoilingFurnace',
      1,
      { ...baseTag, damageType1: 'exSpecial', skillType: 'specialSkill' },
      'atk',
      undefined,
      ...exSpecial_dazeInc_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'EXSpecialAttackBoilingFurnace',
      2,
      { ...baseTag, damageType1: 'exSpecial', skillType: 'specialSkill' },
      'atk',
      undefined,
      ...exSpecial_dazeInc_
    )
  ),

  ...customDmg(
    'm6_dmg',
    { damageType1: 'elemental' },
    prod(own.final.atk, percent(dm.m6.dmg))
  ),

  // Buffs
  registerBuff('basic_dmg_', basic_dmg_, undefined, undefined, false),
  registerBuff('basic_dazeInc_', basic_dazeInc_, undefined, undefined, false),
  registerBuff(
    'basic_common_dmg_',
    teamBuff.combat.common_dmg_.add(
      cmpGE(char.potential, 1, cmpGE(furnaceFire, 1, percent(0.35)))
    ),
    undefined,
    true
  ),
  registerBuff(
    'exSpecial_dazeInc_',
    exSpecial_dazeInc_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'core_exSpecial_dazeInc_',
    ownBuff.combat.dazeInc_.addWithDmgType(
      'exSpecial',
      percent(subscript(char.core, dm.core.dazeInc_))
    )
  ),
  registerBuff('core_dazeInc_', core_dazeInc_, undefined, undefined, false),
  registerBuff(
    'ability_chain_dmg_',
    teamBuff.combat.dmg_.addWithDmgType(
      'chain',
      cmpGE(
        sum(
          team.common.count.fire,
          team.common.count.withFaction('BelebogHeavyIndustries'),
          team.common.count.withSpecialty('rupture'),
          team.common.count.withSpecialty('armorer')
        ),
        3,
        isStunned.ifOn(prod(exSpecial_debuff, percent(dm.ability.chain_dmg_)))
      )
    )
  ),
  registerBuff(
    'potential_laceration_dmg_',
    teamBuff.combat.laceration_dmg_.add(
      cmpEq(
        target.char.specialty,
        'armorer',
        percent(subscript(char.potential, dm.potential.laceration_dmg_))
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'potential_crit_dmg_',
    teamBuff.combat.crit_dmg_.add(
      cmpNE(
        target.char.specialty,
        'armorer',
        percent(subscript(char.potential, dm.potential.crit_dmg_))
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'm1_special_dazeInc_',
    ownBuff.combat.dazeInc_.addWithDmgType(
      'special',
      cmpGE(char.mindscape, 1, quick_use.ifOn(percent(dm.m1.dazeInc_)))
    )
  ),
  registerBuff(
    'm1_exSpecial_dazeInc_',
    ownBuff.combat.dazeInc_.addWithDmgType(
      'exSpecial',
      cmpGE(char.mindscape, 1, quick_use.ifOn(percent(dm.m1.dazeInc_)))
    )
  ),
  registerBuff(
    'm4_chain_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'chain',
      cmpGE(char.mindscape, 4, prod(charge, percent(dm.m4.chain_ult_dmg_)))
    )
  ),
  registerBuff(
    'm4_ult_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'ult',
      cmpGE(char.mindscape, 4, prod(charge, percent(dm.m4.chain_ult_dmg_)))
    )
  )
)
export default sheet
