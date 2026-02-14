import { cmpGE, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  allNumConditionals,
  customShield,
  enemyDebuff,
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
  getBaseTag,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'Lycaon'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { exSpecial_assistFollowUp_hit, stunned_enemy_hit } =
  allBoolConditionals(key)
const { charged_hits } = allNumConditionals(key, true, 0, dm.m6.stacks)
const { durationLeft } = allNumConditionals(
  key,
  true,
  0,
  dm.core.encirclePreyDuration
)

const core_basic_dazeInc_ = ownBuff.combat.dazeInc_.addWithDmgType(
  'basic',
  percent(subscript(char.core, dm.core.dazeInc_))
)
const core_assistFollowUp_dazeInc_ = ownBuff.combat.dazeInc_.addWithDmgType(
  'assistFollowUp',
  prod(durationLeft, percent(dm.core.durationRemaining_dazeInc_))
)
const m1_dazeInc_ = ownBuff.combat.dazeInc_.add(
  cmpGE(char.mindscape, 1, percent(dm.m1.dazeInc_))
)
const m1_fullCharge_dazeInc_ = ownBuff.combat.dazeInc_.add(
  cmpGE(
    char.mindscape,
    1,
    sum(percent(dm.m1.dazeInc_), percent(dm.m1.dazeInc_full_charge))
  )
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    // Every other basic attack is physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackMoonHunter',
      0,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackMoonHunter',
      2,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackMoonHunter',
      4,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackMoonHunter',
      6,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackMoonHunter',
      8,
      { damageType1: 'basic' },
      'atk'
    ),
    // Dash attack is physical
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackKeepItClean',
      0,
      { damageType1: 'dash' },
      'atk'
    ),
    // Per-hit buffs
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackMoonHunter',
      1,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ...core_basic_dazeInc_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackMoonHunter',
      3,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ...core_basic_dazeInc_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackMoonHunter',
      5,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ...core_basic_dazeInc_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackMoonHunter',
      7,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ...core_basic_dazeInc_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackMoonHunter',
      9,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ...core_basic_dazeInc_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackMoonHunter',
      10,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ...core_basic_dazeInc_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'EXSpecialAttackThrillOfTheHunt',
      0,
      { ...baseTag, damageType1: 'exSpecial' },
      'atk',
      undefined,
      m1_dazeInc_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'EXSpecialAttackThrillOfTheHunt',
      1,
      { ...baseTag, damageType1: 'exSpecial' },
      'atk',
      undefined,
      m1_fullCharge_dazeInc_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'assist',
      'AssistFollowUpVengefulCounterattackGlacialWaltz',
      0,
      { ...baseTag, damageType1: 'assistFollowUp' },
      'atk',
      undefined,
      ...core_assistFollowUp_dazeInc_
    )
  ),

  ...customShield(
    'm4_shield',
    cmpGE(char.mindscape, 4, prod(own.final.hp, percent(dm.m4.shield)))
  ),

  // Buffs
  registerBuff(
    'core_basic_dazeInc_',
    core_basic_dazeInc_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'core_dodgeCounter_dazeInc_',
    ownBuff.combat.dazeInc_.addWithDmgType(
      'dodgeCounter',
      percent(subscript(char.core, dm.core.dazeInc_))
    )
  ),
  registerBuff(
    'core_dash_dazeInc_',
    ownBuff.combat.dazeInc_.addWithDmgType(
      'dash',
      percent(subscript(char.core, dm.core.dazeInc_))
    )
  ),
  registerBuff(
    'core_assistFollowUp_dazeInc_',
    core_assistFollowUp_dazeInc_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'core_ice_resRed_',
    enemyDebuff.common.resRed_.ice.add(
      exSpecial_assistFollowUp_hit.ifOn(percent(dm.core.ice_resRed_))
    )
  ),
  registerBuff(
    'core_ether_resRed_',
    enemyDebuff.common.resRed_.ether.add(
      exSpecial_assistFollowUp_hit.ifOn(percent(dm.core.other_resRed_))
    )
  ),
  registerBuff(
    'core_electric_resRed_',
    enemyDebuff.common.resRed_.electric.add(
      exSpecial_assistFollowUp_hit.ifOn(percent(dm.core.other_resRed_))
    )
  ),
  registerBuff(
    'core_fire_resRed_',
    enemyDebuff.common.resRed_.fire.add(
      exSpecial_assistFollowUp_hit.ifOn(percent(dm.core.other_resRed_))
    )
  ),
  registerBuff(
    'core_physical_resRed_',
    enemyDebuff.common.resRed_.physical.add(
      exSpecial_assistFollowUp_hit.ifOn(percent(dm.core.other_resRed_))
    )
  ),
  registerBuff(
    'ability_stun_',
    enemyDebuff.common.stun_.add(
      cmpGE(
        sum(
          team.common.count.ice,
          team.common.count.withFaction('VictoriaHousekeepingCo'),
          team.common.count.withSpecialty('anomaly')
        ),
        3,
        stunned_enemy_hit.ifOn(percent(dm.ability.stun_))
      )
    )
  ),
  registerBuff('m1_dazeInc_', m1_dazeInc_, undefined, undefined, false),
  registerBuff(
    'm1_fullCharge_dazeInc_',
    m1_fullCharge_dazeInc_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'm6_common_dmg_',
    ownBuff.combat.common_dmg_.add(
      cmpGE(char.mindscape, 6, prod(charged_hits, percent(dm.m6.common_dmg_)))
    )
  )
)
export default sheet
