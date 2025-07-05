import { cmpGE, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  customDmg,
  customShield,
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

const key: CharacterKey = 'Ben'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { shieldOn, enemyBlocked, attackLaunched } = allBoolConditionals(key)

const m4_dmg_ = ownBuff.combat.common_dmg_.add(
  cmpGE(char.mindscape, 4, enemyBlocked.ifOn(percent(dm.m4.dmg_)))
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    // Basic attack is physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackDebtReconciliation',
      0,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackDebtReconciliation',
      1,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackDebtReconciliation',
      2,
      { damageType1: 'basic' },
      'atk'
    ),
    // Dash attack is physical
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackIncomingExpense',
      0,
      { damageType1: 'dash' },
      'atk'
    ),
    // Special is physical
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'SpecialAttackFiscalFist',
      0,
      { damageType1: 'special' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'SpecialAttackFiscalFist',
      1,
      { damageType1: 'special' },
      'atk',
      undefined,
      m4_dmg_
    ),
    // Per-hit buffs
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'EXSpecialAttackCashflowCounter',
      2,
      { ...baseTag, damageType1: 'special' },
      'atk',
      undefined,
      m4_dmg_
    )
  ),

  ...customShield('special_shield', prod(own.final.hp, percent(0.16))), // No data in dm
  ...customShield(
    'core_shield',
    sum(
      prod(own.final.def, percent(subscript(char.core, dm.core.shield_))),
      subscript(char.core, dm.core.shield)
    )
  ),
  ...customDmg(
    'm2_dmg',
    { damageType1: 'elemental' },
    cmpGE(char.mindscape, 2, prod(own.final.def, percent(dm.m2.dmg)))
  ),

  // Buffs
  registerBuff(
    'core_atk',
    ownBuff.initial.atk.add(
      prod(own.initial.def, percent(subscript(char.core, dm.core.atk)))
    )
  ),
  registerBuff(
    'ability_crit_',
    teamBuff.combat.crit_.add(
      cmpGE(
        sum(
          team.common.count.fire,
          team.common.count.withFaction('BelebogHeavyIndustries')
        ),
        3,
        shieldOn.ifOn(percent(dm.ability.crit_))
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'm1_dmg_red_',
    teamBuff.combat.dmg_red_.add(
      cmpGE(char.mindscape, 1, enemyBlocked.ifOn(percent(dm.m1.dmg_red_)))
    ),
    undefined,
    true
  ),
  registerBuff('m4_dmg_', m4_dmg_, undefined, undefined, false),
  registerBuff(
    'm6_basic_dazeInc_',
    ownBuff.combat.dazeInc_.addWithDmgType(
      'basic',
      cmpGE(char.mindscape, 6, attackLaunched.ifOn(percent(dm.m6.dazeInc_)))
    )
  ),
  registerBuff(
    'm6_dash_dazeInc_',
    ownBuff.combat.dazeInc_.addWithDmgType(
      'dash',
      cmpGE(char.mindscape, 6, attackLaunched.ifOn(percent(dm.m6.dazeInc_)))
    )
  ),
  registerBuff(
    'm6_dodgeCounter_dazeInc_',
    ownBuff.combat.dazeInc_.addWithDmgType(
      'dodgeCounter',
      cmpGE(char.mindscape, 6, attackLaunched.ifOn(percent(dm.m6.dazeInc_)))
    )
  )
)
export default sheet
