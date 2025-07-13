import { cmpGE, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  allNumConditionals,
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

const key: CharacterKey = 'Ellen'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { ice_attacks } = allNumConditionals(key, true, 0, dm.ability.stacks)
const { exSpecial_chain_quickCharge, feast_begins } = allBoolConditionals(key)
const { flash_freeze_consumed } = allNumConditionals(key, true, 0, dm.m1.stacks)
const { flash_freeze } = allNumConditionals(key, true, 0, 3)

const core_basic_crit_dmg_ = ownBuff.combat.crit_dmg_.addWithDmgType(
  'basic',
  percent(subscript(char.core, dm.core.crit_dmg_))
)
const core_dash_crit_dmg_ = ownBuff.combat.crit_dmg_.addWithDmgType(
  'dash',
  percent(subscript(char.core, dm.core.crit_dmg_))
)
const m6_dash_mv_mult = ownBuff.dmg.mv_mult_.addWithDmgType(
  'dash',
  cmpGE(char.mindscape, 6, feast_begins.ifOn(percent(dm.m6.mv_mult_)))
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    // Basic attack saw teeth trimming is physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackSawTeethTrimming',
      0,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackSawTeethTrimming',
      1,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackSawTeethTrimming',
      2,
      { damageType1: 'basic' },
      'atk'
    ),
    // Dash attack monstrous wave is physical
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackMonstrousWave',
      0,
      { damageType1: 'dash' },
      'atk'
    ),
    // Per-hit buffs
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackArcticAmbush',
      2,
      { ...baseTag, damageType1: 'dash' },
      'atk',
      undefined,
      ...core_dash_crit_dmg_,
      ...m6_dash_mv_mult
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackFlashFreezeTrimming',
      0,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ...core_basic_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackFlashFreezeTrimming',
      1,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ...core_basic_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackFlashFreezeTrimming',
      2,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ...core_basic_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackGlacialBladeWave',
      0,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ...core_basic_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackGlacialBladeWave',
      1,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ...core_basic_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackIcyBlade',
      0,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ...core_basic_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackIcyBlade',
      1,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ...core_basic_crit_dmg_
    )
    // TODO: a hit should be here
    // dmgDazeAndAnomOverride(
    //   dm,
    //   'basic',
    //   'BasicAttackIcyBlade',
    //   2,
    //   { ...baseTag, damageType1: 'basic' },
    //   'atk',
    //   undefined,
    //   ...core_basic_crit_dmg_
    // )
  ),

  // Buffs
  registerBuff(
    'core_basic_crit_dmg_',
    core_basic_crit_dmg_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'core_dash_crit_dmg_',
    core_dash_crit_dmg_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'core_chain_crit_dmg_',
    ownBuff.combat.crit_dmg_.addWithDmgType(
      'chain',
      percent(subscript(char.core, dm.core.crit_dmg_))
    )
  ),
  registerBuff(
    'core_ult_crit_dmg_',
    ownBuff.combat.crit_dmg_.addWithDmgType(
      'ult',
      percent(subscript(char.core, dm.core.crit_dmg_))
    )
  ),
  registerBuff(
    'ability_ice_dmg_',
    ownBuff.combat.dmg_.ice.add(
      cmpGE(
        sum(
          team.common.count.withSpecialty('stun'),
          team.common.count.ice,
          team.common.count.withFaction('VictoriaHousekeepingCo')
        ),
        3,
        prod(ice_attacks, percent(dm.ability.ice_dmg_))
      )
    )
  ),
  registerBuff(
    'm1_crit_',
    ownBuff.combat.crit_.add(
      cmpGE(
        char.mindscape,
        1,
        prod(flash_freeze_consumed, percent(dm.m1.crit_))
      )
    )
  ),
  registerBuff(
    'm2_exSpecial_crit_dmg_',
    ownBuff.combat.crit_dmg_.addWithDmgType(
      'exSpecial',
      cmpGE(char.mindscape, 2, prod(flash_freeze, percent(dm.m2.crit_dmg_)))
    )
  ),
  registerBuff(
    'm6_pen_',
    ownBuff.combat.pen_.add(
      cmpGE(
        char.mindscape,
        6,
        exSpecial_chain_quickCharge.ifOn(percent(dm.m6.pen_))
      )
    )
  ),
  registerBuff('m6_dash_mv_mult_', m6_dash_mv_mult, undefined, undefined, false)
)
export default sheet
