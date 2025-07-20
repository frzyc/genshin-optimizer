import type { NumNode } from '@genshin-optimizer/pando/engine'
import { cmpGE, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
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

const key: CharacterKey = 'Vivian'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { abloom, prophecy, fluttering_featherbloom_used } =
  allBoolConditionals(key)

const abilityCheck = (node: NumNode | number) =>
  cmpGE(
    sum(team.common.count.withSpecialty('anomaly'), team.common.count.ether),
    3,
    node
  )
const m4_crit_ = ownBuff.combat.crit_.add(cmpGE(char.mindscape, 4, percent(1)))

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    // Basic hits 1-3 are physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackFeatheredStrike',
      0,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackFeatheredStrike',
      1,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackFeatheredStrike',
      2,
      { damageType1: 'basic' },
      'atk'
    ),
    // Dash attack is physical
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackSilverThornedMelody',
      0,
      { damageType1: 'dash' },
      'atk'
    ),
    // Per-hit buffs
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackFlutteringFrockSuspension',
      0,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      m4_crit_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackFeatherbloom',
      0,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      m4_crit_
    )
  ),

  ...customDmg(
    'core_prophecy_dmg',
    { ...baseTag, damageType1: 'elemental' },
    prod(own.final.atk, percent(dm.core.dmg))
  ),

  // Buffs
  registerBuff(
    'core_ether_abloom',
    teamBuff.dmg.anom_mv_mult_.ether.add(
      abloom.ifOn(
        prod(
          percent(subscript(char.core, dm.core.dmg_ether)),
          percent(1 / dm.core.anomProf_step),
          own.final.anomProf
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'core_electric_abloom',
    teamBuff.dmg.anom_mv_mult_.electric.add(
      abloom.ifOn(
        prod(
          percent(subscript(char.core, dm.core.dmg_electric)),
          percent(1 / dm.core.anomProf_step),
          target.final.anomProf
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'core_fire_abloom',
    teamBuff.dmg.anom_mv_mult_.fire.add(
      abloom.ifOn(
        prod(
          percent(subscript(char.core, dm.core.dmg_fire)),
          percent(1 / dm.core.anomProf_step),
          target.final.anomProf
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'core_physical_abloom',
    teamBuff.dmg.anom_mv_mult_.physical.add(
      abloom.ifOn(
        prod(
          percent(subscript(char.core, dm.core.dmg_physical)),
          percent(1 / dm.core.anomProf_step),
          target.final.anomProf
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'core_ice_abloom',
    teamBuff.dmg.anom_mv_mult_.ice.add(
      abloom.ifOn(
        prod(
          percent(subscript(char.core, dm.core.dmg_ice)),
          percent(1 / dm.core.anomProf_step),
          target.final.anomProf
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'ability_corruption_dmg_',
    teamBuff.combat.buff_.ether.addWithDmgType(
      'anomaly',
      abilityCheck(dm.ability.ether_anom_dmg_)
    ),
    undefined,
    true
  ),
  registerBuff(
    'ability_corruption_disorder_dmg_',
    teamBuff.combat.buff_.ether.addWithDmgType(
      'disorder',
      abilityCheck(dm.ability.ether_anom_dmg_)
    ),
    undefined,
    true
  ),
  registerBuff(
    'm1_anomaly_dmg_',
    teamBuff.combat.buff_.addWithDmgType(
      'anomaly',
      cmpGE(char.mindscape, 1, prophecy.ifOn(dm.m1.anomaly_disorder_dmg_))
    ),
    undefined,
    true
  ),
  registerBuff(
    'm1_disorder_dmg_',
    teamBuff.combat.buff_.addWithDmgType(
      'disorder',
      cmpGE(char.mindscape, 1, prophecy.ifOn(dm.m1.anomaly_disorder_dmg_))
    ),
    undefined,
    true
  ),
  registerBuff(
    'm2_ether_anomBuildup_',
    ownBuff.combat.anomBuildup_.ether.add(
      cmpGE(char.mindscape, 2, dm.m2.ether_anomBuildup_)
    )
  ),
  registerBuff(
    'm2_anom_mv_mult_',
    teamBuff.dmg.anom_mv_mult_.add(
      cmpGE(char.mindscape, 2, abloom.ifOn(dm.m2.abloom_bonus))
    ),
    undefined,
    true
  ),
  registerBuff(
    'm2_resIgn_',
    teamBuff.combat.resIgn_.addWithDmgType(
      'anomaly',
      cmpGE(char.mindscape, 2, abloom.ifOn(dm.m2.resIgn_))
    ),
    undefined,
    true
  ),
  registerBuff('m4_crit_', m4_crit_, undefined, undefined, false),
  registerBuff(
    'm4_atk_',
    ownBuff.combat.atk_.add(
      cmpGE(char.mindscape, 4, fluttering_featherbloom_used.ifOn(dm.m4.atk_))
    )
  ),
  registerBuff(
    'm6_ether_dmg_',
    ownBuff.combat.dmg_.ether.add(cmpGE(char.mindscape, 6, dm.m6.ether_dmg_))
  )
)
export default sheet
