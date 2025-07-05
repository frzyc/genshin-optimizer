import {
  cmpEq,
  cmpGE,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  allNumConditionals,
  enemy,
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

const key: CharacterKey = 'Soldier11'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { fireSuppression_triggered, fireSuppression_4th_hit, charge_consumed } =
  allBoolConditionals(key)
const { m2_stacks } = allNumConditionals(key, true, 0, dm.m2.stacks)

const core_common_dmg_ = ownBuff.combat.common_dmg_.add(
  percent(subscript(char.core, dm.core.common_dmg_))
)
const m2_common_dmg_ = ownBuff.combat.common_dmg_.add(
  cmpGE(char.mindscape, 2, prod(m2_stacks, percent(dm.m2.common_dmg_)))
)
const m6_fire_resIgn_ = ownBuff.combat.resIgn_.fire.add(
  cmpGE(char.mindscape, 6, charge_consumed.ifOn(dm.m6.fire_resIgn_))
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    // Basic Attack Warmup Sparks is physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackWarmupSparks',
      0,
      { damageType1: 'basic' },
      'atk',
      undefined
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackWarmupSparks',
      1,
      { damageType1: 'basic' },
      'atk',
      undefined
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackWarmupSparks',
      2,
      { damageType1: 'basic' },
      'atk',
      undefined
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackWarmupSparks',
      3,
      { damageType1: 'basic' },
      'atk',
      undefined
    ),
    // Dash Attack Blazing Fire is physical
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackBlazingFire',
      0,
      { damageType1: 'dash' },
      'atk',
      undefined
    ),
    // Per-hit buffs
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackFireSuppression',
      0,
      {
        ...baseTag,
        damageType1: 'basic',
      },
      'atk',
      undefined,
      core_common_dmg_,
      m2_common_dmg_,
      m6_fire_resIgn_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackFireSuppression',
      1,
      {
        ...baseTag,
        damageType1: 'basic',
      },
      'atk',
      undefined,
      core_common_dmg_,
      m2_common_dmg_,
      m6_fire_resIgn_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackFireSuppression',
      2,
      {
        ...baseTag,
        damageType1: 'basic',
      },
      'atk',
      undefined,
      core_common_dmg_,
      m2_common_dmg_,
      m6_fire_resIgn_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackFireSuppression',
      3,
      {
        ...baseTag,
        damageType1: 'basic',
      },
      'atk',
      undefined,
      core_common_dmg_,
      m2_common_dmg_,
      m6_fire_resIgn_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackFireSuppression',
      0,
      {
        ...baseTag,
        damageType1: 'dash',
      },
      'atk',
      undefined,
      core_common_dmg_,
      m2_common_dmg_,
      m6_fire_resIgn_
    )
  ),

  // Buffs
  registerBuff(
    'core_common_dmg_',
    core_common_dmg_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'ability_fire_dmg_',
    ownBuff.combat.dmg_.fire.add(
      cmpGE(
        sum(
          team.common.count.fire,
          team.common.count.withFaction('NewEriduDefenseForce')
        ),
        3,
        sum(
          dm.ability.fire_dmg_,
          cmpEq(enemy.common.isStunned, 1, dm.ability.fire_dmg_additional)
        )
      )
    )
  ),
  registerBuff('m2_common_dmg_', m2_common_dmg_, undefined, undefined, false),
  registerBuff(
    'm2_dodgeCounter_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'dodgeCounter',
      cmpGE(char.mindscape, 2, prod(m2_stacks, percent(dm.m2.common_dmg_)))
    )
  ),
  registerBuff(
    'm4_dmg_red_',
    ownBuff.combat.dmg_red_.add(
      cmpGE(
        char.mindscape,
        4,
        fireSuppression_triggered.ifOn(
          fireSuppression_4th_hit.ifOn(percent(1), dm.m4.dmg_red_)
        )
      )
    )
  ),
  registerBuff('m6_fire_resIgn_', m6_fire_resIgn_, undefined, undefined, false)
)
export default sheet
