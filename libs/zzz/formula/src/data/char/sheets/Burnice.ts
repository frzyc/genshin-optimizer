import {
  cmpGE,
  constant,
  min,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allNumConditionals,
  customAnomalyBuildup,
  customAnomalyDmg,
  customDmg,
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

const key: CharacterKey = 'Burnice'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { thermal_penetration } = allNumConditionals(key, true, 0, dm.m2.stacks)

const core_afterburn_dmg_ = ownBuff.combat.common_dmg_.add(
  min(
    dm.core.max_afterburn_dmg_,
    prod(1 / dm.core.anomProf_step, dm.core.afterburn_dmg_, own.final.anomProf)
  )
)
const ability_fire_anomBuildup_ = ownBuff.combat.anomBuildup_.fire.add(
  cmpGE(
    sum(
      team.common.count.withSpecialty('anomaly'),
      team.common.count.withFaction('SonsOfCalydon')
    ),
    3,
    dm.ability.fire_anomBuildup
  )
)
const m1_afterburn_fire_anomBuildup_ = ownBuff.combat.anomBuildup_.fire.add(
  cmpGE(char.mindscape, 1, dm.m1.afterburn_fire_anomBuildup_)
)
const m6_fire_resIgn_ = ownBuff.combat.resIgn_.fire.add(
  cmpGE(char.mindscape, 6, dm.m6.exSpecial_specialAfterburn_burn_fire_resIgn_)
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    // Basic Direct Flame Blend hit 2 is physical, hit 1 partially physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackDirectFlameBlend',
      1,
      { damageType1: 'basic' },
      'atk'
    ),
    // Dodge Fluttering Steps is partially physical
    // Per-hit buffs
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackMixedFlameBlend',
      0,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ability_fire_anomBuildup_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackMixedFlameBlend',
      1,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ability_fire_anomBuildup_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'EXSpecialAttackIntenseHeatStirringMethod',
      0,
      { ...baseTag, damageType1: 'exSpecial' },
      'atk',
      undefined,
      ability_fire_anomBuildup_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'EXSpecialAttackIntenseHeatStirringMethod',
      1,
      { ...baseTag, damageType1: 'exSpecial' },
      'atk',
      undefined,
      ability_fire_anomBuildup_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'EXSpecialAttackIntenseHeatStirringMethodDoubleShot',
      0,
      { ...baseTag, damageType1: 'exSpecial' },
      'atk',
      undefined,
      ability_fire_anomBuildup_,
      m6_fire_resIgn_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'EXSpecialAttackIntenseHeatStirringMethodDoubleShot',
      1,
      { ...baseTag, damageType1: 'exSpecial' },
      'atk',
      undefined,
      ability_fire_anomBuildup_,
      m6_fire_resIgn_
    )
  ),

  ...customDmg(
    'core_afterburn_dmg',
    { ...baseTag, skillType: 'assistSkill' },
    prod(
      own.final.atk,
      sum(
        subscript(char.core, dm.core.afterburn_dmg),
        cmpGE(char.mindscape, 1, dm.m1.afterburn_dmg)
      )
    ),
    undefined,
    core_afterburn_dmg_,
    ability_fire_anomBuildup_,
    m1_afterburn_fire_anomBuildup_
  ),
  ...customAnomalyBuildup(
    'core_afterburn_anomBuildup',
    {
      ...baseTag,
      skillType: 'assistSkill',
    },
    constant(60),
    undefined,
    core_afterburn_dmg_,
    ability_fire_anomBuildup_,
    m1_afterburn_fire_anomBuildup_
  ),
  ...customDmg(
    'm6_additional_afterburn_dmg',
    { ...baseTag, skillType: 'assistSkill' },
    cmpGE(char.mindscape, 6, prod(own.final.atk, dm.m6.special_afterburn_dmg)),
    undefined,
    m6_fire_resIgn_
  ),
  ...customAnomalyDmg(
    'm6_additional_burn_dmg',
    { ...baseTag, damageType1: 'anomaly' },
    cmpGE(
      char.mindscape,
      6,
      // Random number in place of actual original dmg value
      prod(percent(0.5), dm.m6.additional_burn_dmg, constant(1000))
    )
  ),

  // Buffs
  registerBuff(
    'core_afterburn_dmg_',
    core_afterburn_dmg_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'ability_fire_anomBuildup_',
    ability_fire_anomBuildup_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'm1_afterburn_fire_anomBuildup_',
    m1_afterburn_fire_anomBuildup_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'm2_pen_',
    teamBuff.combat.pen_.add(
      cmpGE(char.mindscape, 2, prod(thermal_penetration, dm.m2.pen_))
    )
  ),
  registerBuff(
    'm4_exSpecial_crit_',
    ownBuff.combat.crit_.addWithDmgType(
      'exSpecial',
      cmpGE(char.mindscape, 4, dm.m4.exSpecial_assist_crit_)
    )
  ),
  registerBuff(
    'm4_assistSkill_crit_',
    ownBuff.combat.crit_.assistSkill.add(
      cmpGE(char.mindscape, 4, dm.m4.exSpecial_assist_crit_)
    )
  ),
  registerBuff(
    'm6_burn_fire_resIgn_',
    ownBuff.combat.resIgn_.fire.addWithDmgType(
      'anomaly',
      cmpGE(
        char.mindscape,
        6,
        dm.m6.exSpecial_specialAfterburn_burn_fire_resIgn_
      )
    )
  ),
  registerBuff('m6_fire_resIgn_', m6_fire_resIgn_, undefined, undefined, false)
)
export default sheet
