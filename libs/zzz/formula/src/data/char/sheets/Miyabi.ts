import type { NumNode } from '@genshin-optimizer/pando/engine'
import {
  cmpGE,
  min,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  allNumConditionals,
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
  dmgDazeAndAnomMerge,
  dmgDazeAndAnomOverride,
  entriesForChar,
  getBaseTag,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'Miyabi'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const {
  ult_used,
  icefire,
  frostburn,
  disorder_triggered,
  level_3_charge_hit,
  polar,
  frostbite,
} = allBoolConditionals(key)
const { fallen_frost } = allNumConditionals(key, true, 0, dm.m1.max_stacks)

const ability_check = (node: NumNode | number) =>
  cmpGE(
    sum(
      team.common.count.withSpecialty('support'),
      team.common.count.withFaction('HollowSpecialOoperationsSection6')
    ),
    2,
    node
  )
const ability_dmg_ = ownBuff.combat.common_dmg_.add(
  ability_check(dm.ability.dmg_)
)
const ability_ice_resIgn_ = ownBuff.combat.resIgn_.ice.add(
  ability_check(disorder_triggered.ifOn(dm.ability.ice_resIgn_))
)
const m1_defIgn_ = ownBuff.combat.defIgn_.add(
  cmpGE(char.mindscape, 1, prod(fallen_frost, percent(dm.m1.defIgn_)))
)
const m2_dmg_ = ownBuff.combat.common_dmg_.add(
  cmpGE(char.mindscape, 2, dm.m2.dmg_)
)
const m4_frostburnBreak_dmg_ = ownBuff.combat.common_dmg_.add(
  cmpGE(char.mindscape, 4, dm.m4.frostburn_dmg_)
)
const m6_dmg_ = ownBuff.combat.common_dmg_.add(
  cmpGE(char.mindscape, 6, polar.ifOn(dm.m6.dmg_))
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    {
      chain: {
        ChainAttackSpringsCall: {
          '0': [
            // Chain needs to be merged
            ...dmgDazeAndAnomMerge(
              [
                dm.chain.ChainAttackSpringsCall[0],
                dm.chain.ChainAttackSpringsCall[1],
                dm.chain.ChainAttackSpringsCall[2],
              ],
              'ChainAttackSpringsCall_0',
              { ...baseTag, damageType1: 'chain' },
              'atk',
              'chain'
            ),
          ],
          '1': [],
          '2': [],
        },
      },
    },
    // Basic Kazahana hits 1-2 are physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackKazahana',
      0,
      { damageType1: 'basic' },
      'atk',
      undefined,
      m2_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackKazahana',
      1,
      { damageType1: 'basic' },
      'atk',
      undefined,
      m2_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackKazahana',
      2,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      m2_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackKazahana',
      3,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      m2_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackKazahana',
      4,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      m2_dmg_
    ),
    // Dash Attack is physical
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackFuyubachi',
      0,
      { damageType1: 'dash' },
      'atk'
    ),
    // Per-hit buffs
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackShimotsuki',
      0,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ability_dmg_,
      ability_ice_resIgn_,
      m1_defIgn_,
      m6_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackShimotsuki',
      1,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ability_dmg_,
      ability_ice_resIgn_,
      m1_defIgn_,
      m6_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackShimotsuki',
      2,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ability_dmg_,
      ability_ice_resIgn_,
      m1_defIgn_,
      m6_dmg_
    )
  ),

  ...customDmg(
    'core_frostburnBreak_dmg',
    { ...baseTag, damageType1: 'anomaly' },
    prod(own.final.atk, subscript(char.core, dm.core.dmg)),
    undefined,
    m4_frostburnBreak_dmg_
  ),

  // Buffs
  // Not in actual sheet, but passive effect from Frostbite
  registerBuff(
    'frostbite_crit_dmg_',
    teamBuff.combat.crit_dmg_.add(frostbite.ifOn(percent(0.1))),
    undefined,
    true
  ),
  registerBuff(
    'ult_ice_dmg_',
    ownBuff.combat.dmg_.ice.add(
      ult_used.ifOn(0.3) // No data in dm
    )
  ),
  registerBuff(
    'core_frost_anomBuildup_',
    ownBuff.combat.anomBuildup_.ice.add(
      min(
        dm.core.max_anomBuildup_,
        prod(own.final.crit_, icefire.ifOn(percent(dm.core.frost_anomBuildup_)))
      )
    )
  ),
  registerBuff(
    'core_anomBuildup_',
    teamBuff.combat.anomBuildup_.add(frostburn.ifOn(dm.core.anomBuildup_)),
    undefined,
    true
  ),
  registerBuff('ability_dmg_', ability_dmg_, undefined, undefined, false),
  registerBuff(
    'ability_ice_resIgn_',
    ability_ice_resIgn_,
    undefined,
    undefined,
    false
  ),
  registerBuff('m1_defIgn_', m1_defIgn_, undefined, undefined, false),
  registerBuff(
    'm1_anomBuildup_',
    teamBuff.combat.anomBuildup_.add(
      cmpGE(char.mindscape, 1, level_3_charge_hit.ifOn(dm.m1.anomBuildup_))
    ),
    undefined,
    true
  ),
  registerBuff('m2_dmg_', m2_dmg_, undefined, undefined, false),
  registerBuff(
    'm2_dodgeCounter_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'dodgeCounter',
      cmpGE(char.mindscape, 2, dm.m2.dmg_)
    )
  ),
  registerBuff(
    'm2_crit_',
    ownBuff.combat.crit_.add(cmpGE(char.mindscape, 2, dm.m2.crit_))
  ),
  registerBuff(
    'm4_frostburnBreak_dmg_',
    m4_frostburnBreak_dmg_,
    undefined,
    undefined,
    false
  ),
  registerBuff('m6_dmg_', m6_dmg_, undefined, undefined, false)
)
export default sheet
