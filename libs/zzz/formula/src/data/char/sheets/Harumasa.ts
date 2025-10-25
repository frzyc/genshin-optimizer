import { cmpGE, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
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
  team,
} from '../../util'
import {
  dmgDazeAndAnomOverride,
  entriesForChar,
  getBaseTag,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'Harumasa'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { enemy_anomaly, electro_blitz, haOtoNoYa } = allBoolConditionals(key)
const { gleaming_edge } = allNumConditionals(key, true, 0, dm.core.max_stacks)

const core_dash_crit_ = ownBuff.combat.crit_.addWithDmgType(
  'dash',
  percent(subscript(char.core, dm.core.crit_))
)
const core_dash_crit_dmg_ = ownBuff.combat.crit_dmg_.addWithDmgType(
  'dash',
  prod(gleaming_edge, percent(subscript(char.core, dm.core.crit_dmg_)))
)
const m2_dash_dmg_ = ownBuff.combat.dmg_.addWithDmgType(
  'dash',
  cmpGE(char.mindscape, 2, electro_blitz.ifOn(percent(dm.m2.dmg_)))
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    // Basic attack cloud piercer hits 1-3 are physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackCloudPiercer',
      0,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackCloudPiercer',
      1,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackCloudPiercer',
      2,
      { damageType1: 'basic' },
      'atk'
    ),
    // Basic attack cloud piercer drift is physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackCloudPiercerDrift',
      0,
      { damageType1: 'basic' },
      'atk'
    ),
    // Dash attack hiten no tsuru is physical
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackHitenNoTsuru',
      0,
      { damageType1: 'dash' },
      'atk'
    ),
    // Per-hit buffs
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackHitenNoTsuruSlash',
      0,
      { ...baseTag, damageType1: 'dash' },
      'atk',
      undefined,
      ...core_dash_crit_,
      ...core_dash_crit_dmg_,
      ...m2_dash_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackHitenNoTsuruSlash',
      1,
      { ...baseTag, damageType1: 'dash' },
      'atk',
      undefined,
      ...core_dash_crit_,
      ...core_dash_crit_dmg_,
      ...m2_dash_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackHitenNoTsuruSlash',
      2,
      { ...baseTag, damageType1: 'dash' },
      'atk',
      undefined,
      ...core_dash_crit_,
      ...core_dash_crit_dmg_,
      ...m2_dash_dmg_
    )
  ),

  ...customDmg(
    'm6_dmg',
    { ...baseTag, damageType1: 'elemental' },
    prod(own.final.atk, percent(dm.m6.dmg))
  ),

  // Buffs
  registerBuff('core_dash_crit_', core_dash_crit_, undefined, undefined, false),
  registerBuff(
    'core_dash_crit_dmg_',
    core_dash_crit_dmg_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'ability_common_dmg_',
    ownBuff.combat.common_dmg_.add(
      cmpGE(
        sum(
          team.common.count.withSpecialty('stun'),
          team.common.count.withSpecialty('anomaly')
        ),
        1,
        cmpGE(
          sum(isStunned.ifOn(1), enemy_anomaly.ifOn(1)),
          1,
          percent(dm.ability.common_dmg_)
        )
      )
    )
  ),
  registerBuff('m2_dash_dmg_', m2_dash_dmg_, undefined, undefined, false),
  registerBuff(
    'm6_electric_resIgn_',
    ownBuff.combat.resIgn_.electric.add(
      cmpGE(char.mindscape, 6, haOtoNoYa.ifOn(percent(dm.m6.electric_resIgn_)))
    )
  )
)
export default sheet
