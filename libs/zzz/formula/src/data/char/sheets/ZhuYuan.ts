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
  customDmg,
  enemy,
  own,
  ownBuff,
  register,
  registerBuff,
} from '../../util'
import {
  dmgDazeAndAnomOverride,
  entriesForChar,
  getBaseTag,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'ZhuYuan'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { ex_chain_ult_used, suppresive_mode } = allBoolConditionals(key)
const { shotshells_hit } = allNumConditionals(key, true, 0, dm.m2.stacks)

const core_dmg_ = ownBuff.combat.common_dmg_.add(
  sum(
    subscript(char.core, dm.core.dmg_),
    cmpEq(enemy.common.isStunned, 1, subscript(char.core, dm.core.dmg_))
  )
)

const m2_basic_dash_ether_dmg_ = ownBuff.combat.dmg_.ether.add(
  cmpGE(char.mindscape, 2, prod(shotshells_hit, dm.m2.basic_dash_ether_dmg_))
)

const m4_basic_dash_ether_res_ign_ = ownBuff.combat.resIgn_.ether.add(
  cmpGE(char.mindscape, 4, dm.m4.basic_dash_ether_res_ign_)
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    // Basic Dont Move is physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackDontMove',
      0,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackDontMove',
      1,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackDontMove',
      2,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackDontMove',
      3,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackDontMove',
      4,
      { damageType1: 'basic' },
      'atk'
    ),
    // Basic Please Do Not Resist 1-3 is physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackPleaseDoNotResist',
      0,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackPleaseDoNotResist',
      1,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackPleaseDoNotResist',
      2,
      { damageType1: 'basic' },
      'atk'
    ),
    // Dash Attack Overwhelming Firepower 1 is physical
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackOverwhelmingFirepower',
      0,
      { damageType1: 'dash' },
      'atk'
    ),
    // Per-hit buffs
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackPleaseDoNotResist',
      3,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      core_dmg_,
      m2_basic_dash_ether_dmg_,
      m4_basic_dash_ether_res_ign_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackPleaseDoNotResist',
      4,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      core_dmg_,
      m2_basic_dash_ether_dmg_,
      m4_basic_dash_ether_res_ign_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackPleaseDoNotResist',
      5,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      core_dmg_,
      m2_basic_dash_ether_dmg_,
      m4_basic_dash_ether_res_ign_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackOverwhelmingFirepower',
      1,
      { ...baseTag, damageType1: 'dash' },
      'atk',
      undefined,
      core_dmg_,
      m2_basic_dash_ether_dmg_,
      m4_basic_dash_ether_res_ign_
    )
  ),

  // TODO: override the assist followup

  // Mindscape 6 custom damage
  ...customDmg(
    'm6_ether_afterglow',
    { ...baseTag, damageType1: 'elemental' },
    cmpGE(char.mindscape, 6, prod(own.final.atk, dm.m6.dmg))
  ),

  // Buffs
  registerBuff('core_dmg_', core_dmg_, undefined, undefined, false),
  registerBuff(
    'ability_crit_',
    ownBuff.combat.crit_.add(ex_chain_ult_used.ifOn(dm.ability.crit_))
  ),
  registerBuff(
    'm2_dmg_red_',
    ownBuff.combat.dmg_red_.add(suppresive_mode.ifOn(dm.m2.dmg_red_))
  ),
  registerBuff(
    'm2_basic_dash_ether_dmg_',
    m2_basic_dash_ether_dmg_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'm4_basic_dash_ether_res_ign_',
    m4_basic_dash_ether_res_ign_,
    undefined,
    undefined,
    false
  )
)
export default sheet
