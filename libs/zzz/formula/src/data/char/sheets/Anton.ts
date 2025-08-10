import { cmpGE, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  allNumConditionals,
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

const key: CharacterKey = 'Anton'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { burst_mode, chain_ult_used } = allBoolConditionals(key)
const { piledriver_crits } = allNumConditionals(key, true, 0, dm.m6.stacks)

const core_piledriver_dmg_ = ownBuff.combat.common_dmg_.add(
  percent(subscript(char.core, dm.core.piledriver_dmg_))
)
const core_drill_dmg_ = ownBuff.combat.common_dmg_.add(
  percent(subscript(char.core, dm.core.drill_dmg_))
)
const m6_dmg_ = ownBuff.combat.common_dmg_.add(
  cmpGE(char.mindscape, 6, prod(piledriver_crits, percent(dm.m6.dmg_)))
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    // Basic Attack Ehusiastic Drills is physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackEnthusiasticDrills',
      0,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackEnthusiasticDrills',
      1,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackEnthusiasticDrills',
      2,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackEnthusiasticDrills',
      3,
      { damageType1: 'basic' },
      'atk',
      undefined,
      core_piledriver_dmg_
    ),
    // Dash attack is physical
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackFireWithFire',
      0,
      { damageType1: 'dash' },
      'atk'
    ),
    // Dodge Counter Retaliation is physical
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DodgeCounterRetaliation',
      0,
      { damageType1: 'dodgeCounter' },
      'atk'
    ),
    // Quick Assist Shoulder to Shoulder is physical
    dmgDazeAndAnomOverride(
      dm,
      'assist',
      'QuickAssistShoulderToShoulder',
      0,
      { damageType1: 'quickAssist' },
      'atk'
    ),
    // Per-hit buffs
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackEnthusiasticDrillsBurstMode',
      0,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      m6_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackEnthusiasticDrillsBurstMode',
      1,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      core_drill_dmg_,
      m6_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackEnthusiasticDrillsBurstMode',
      2,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      core_piledriver_dmg_,
      m6_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'SpecialAttackSpinBro',
      0,
      { ...baseTag, damageType1: 'special' },
      'atk',
      undefined,
      core_piledriver_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'EXSpecialAttackSmashTheHorizonBro',
      0,
      { ...baseTag, damageType1: 'exSpecial' },
      'atk',
      undefined,
      core_piledriver_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'SpecialAttackExplosiveDrillBurstMode',
      0,
      { ...baseTag, damageType1: 'special' },
      'atk',
      undefined,
      core_piledriver_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DodgeCounterOverloadDrillBurstMode',
      0,
      { ...baseTag, damageType1: 'dodgeCounter' },
      'atk',
      undefined,
      core_drill_dmg_,
      m6_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'chain',
      'ChainAttackGoGoGo',
      0,
      { ...baseTag, damageType1: 'chain' },
      'atk',
      undefined,
      core_piledriver_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'chain',
      'UltimateGoGoGoGoGo',
      0,
      { ...baseTag, damageType1: 'ult' },
      'atk',
      undefined,
      core_piledriver_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'assist',
      'QuickAssistProtectiveDrillBurstMode',
      0,
      { ...baseTag, damageType1: 'quickAssist' },
      'atk',
      undefined,
      core_drill_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'assist',
      'AssistFollowUpLimitBurst',
      0,
      { ...baseTag, damageType1: 'assistFollowUp' },
      'atk',
      undefined,
      core_drill_dmg_
    )
  ),

  ...customShield(
    'm2_shield',
    cmpGE(char.mindscape, 2, prod(own.final.hp, percent(dm.m2.shield)))
  ),

  // Buffs
  registerBuff(
    'core_piledriver_dmg_',
    core_piledriver_dmg_,
    undefined,
    false,
    false
  ),
  registerBuff('core_drill_dmg_', core_drill_dmg_, undefined, false, false),
  registerBuff(
    'ability_electric_anom_mv_mult_',
    ownBuff.dmg.anom_mv_mult_.electric.add(
      cmpGE(
        sum(
          team.common.count.electric,
          team.common.count.withFaction('BelebogHeavyIndustries')
        ),
        3,
        burst_mode.ifOn(percent(dm.ability.dmg))
      )
    )
  ),
  registerBuff(
    'm4_crit_',
    teamBuff.combat.crit_.add(
      cmpGE(char.mindscape, 4, chain_ult_used.ifOn(percent(dm.m4.crit_)))
    ),
    undefined,
    true
  ),
  registerBuff('m6_dmg_', m6_dmg_, undefined, false, false)
)
export default sheet
