import { cmpGE, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  allNumConditionals,
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
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'Grace'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]

const { char } = own

const { fullZap, grenadeHit, chargeConsumed } = allBoolConditionals(key)
const { exSpecialHit } = allNumConditionals(key, true, 0, dm.ability.stacks)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    // Basic hits 1, 2 and 4 are physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackHighPressureSpike',
      0,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackHighPressureSpike',
      1,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackHighPressureSpike',
      3,
      { damageType1: 'basic' },
      'atk'
    ),
    // Dash attack is physical
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackQuickInspection',
      0,
      { damageType1: 'dash' },
      'atk'
    )
  ),

  // Buffs
  registerBuff(
    'core_special_electric_anomBuildup_',
    ownBuff.combat.anomBuildup_.electric.addWithDmgType(
      'special',
      fullZap.ifOn(percent(subscript(char.core, dm.core.electric_anomBuildup_)))
    )
  ),
  registerBuff(
    'core_exSpecial_electric_anomBuildup_',
    ownBuff.combat.anomBuildup_.electric.addWithDmgType(
      'exSpecial',
      fullZap.ifOn(percent(subscript(char.core, dm.core.electric_anomBuildup_)))
    )
  ),
  registerBuff(
    'ability_shock_dmg_',
    ownBuff.combat.dmg_.electric.addWithDmgType(
      'anomaly',
      cmpGE(
        sum(
          team.common.count.electric,
          team.common.count.withFaction('BelebogHeavyIndustries')
        ),
        3,
        prod(exSpecialHit, percent(dm.ability.shock_dmg_))
      )
    )
  ),
  registerBuff(
    'm2_electric_resRed_',
    enemyDebuff.common.resRed_.electric.add(
      cmpGE(char.mindscape, 2, grenadeHit.ifOn(percent(dm.m2.electric_resRed_)))
    ),
    undefined,
    true
  ),
  registerBuff(
    'm2_electric_anomBuildupResRed_',
    enemyDebuff.common.anomBuildupRes_.electric.add(
      cmpGE(
        char.mindscape,
        2,
        grenadeHit.ifOn(percent(-dm.m2.electric_anomBuildupResRed_))
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'm4_enerRegen_',
    ownBuff.combat.enerRegen_.add(
      cmpGE(char.mindscape, 4, chargeConsumed.ifOn(percent(dm.m4.enerRegen_)))
    )
  ),
  registerBuff(
    'm6_special_mv_mult_',
    ownBuff.dmg.mv_mult_.addWithDmgType(
      'special',
      cmpGE(char.mindscape, 6, fullZap.ifOn(percent(dm.m6.mv_mult_)))
    )
  ),
  registerBuff(
    'm6_exSpecial_mv_mult_',
    ownBuff.dmg.mv_mult_.addWithDmgType(
      'exSpecial',
      cmpGE(char.mindscape, 6, fullZap.ifOn(percent(dm.m6.mv_mult_)))
    )
  )
)
export default sheet
