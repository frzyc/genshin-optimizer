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
  customDaze,
  customDmg,
  enemyDebuff,
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

const key: CharacterKey = 'Trigger'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { aftershock_hit } = allBoolConditionals(key)
const { hunters_gaze } = allNumConditionals(key, true, 0, dm.m2.stacks)

const m6_armor_break_rounds_dmg_ = ownBuff.combat.common_dmg_.add(
  cmpGE(char.mindscape, 6, dm.m6.round_dmg_)
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    // Basic 1-3 is physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackColdBoreShot',
      0,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackColdBoreShot',
      1,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackColdBoreShot',
      2,
      { damageType1: 'basic' },
      'atk'
    ),
    // Basic Harmonizing Shot is aftershock
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackHarmonizingShot',
      0,
      { ...baseTag, damageType1: 'basic', damageType2: 'aftershock' },
      'atk'
    ),
    // Basic Harmonizing Shot Tartarus is aftershock
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackHarmonizingShotTartarus',
      0,
      { ...baseTag, damageType1: 'basic', damageType2: 'aftershock' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackHarmonizingShotTartarus',
      1,
      { ...baseTag, damageType1: 'basic', damageType2: 'aftershock' },
      'atk'
    ),
    // Dash Vengeful Specter is physical
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackVengefulSpecter',
      0,
      { damageType1: 'dash' },
      'atk'
    )
  ),

  ...customDmg(
    'm4_disconnect_dmg',
    { ...baseTag },
    cmpGE(char.mindscape, 4, prod(own.final.atk, dm.m4.dmg))
  ),
  ...customDaze(
    'm4_disconnect_daze',
    { ...baseTag },
    cmpGE(char.mindscape, 4, dm.m4.daze)
  ),
  ...customDmg(
    'm6_armor_break_rounds_dmg',
    { ...baseTag },
    cmpGE(char.mindscape, 6, prod(own.final.atk, dm.m6.round_electric_dmg)),
    undefined,
    m6_armor_break_rounds_dmg_
  ),

  // Buffs
  registerBuff(
    'core_stun_',
    enemyDebuff.common.stun_.add(
      aftershock_hit.ifOn(subscript(char.core, dm.core.stun_))
    )
  ),
  registerBuff(
    'ability_aftershock_dazeInc_',
    ownBuff.combat.dazeInc_.addWithDmgType(
      'aftershock',
      cmpGE(
        sum(
          team.common.count.withSpecialty('attack'),
          team.common.count.electric
        ),
        2,
        min(
          prod(
            sum(own.final.crit_, percent(-dm.ability.crit_threshold_)),
            dm.ability.aftershock_dazeInc_,
            100
          ),
          dm.ability.max_dazeInc_
        )
      )
    )
  ),
  registerBuff(
    'm1_stun_',
    enemyDebuff.common.stun_.addWithDmgType(
      'aftershock',
      cmpGE(char.mindscape, 1, aftershock_hit.ifOn(dm.m1.stun_))
    )
  ),
  registerBuff(
    'm2_crit_dmg_',
    teamBuff.combat.crit_dmg_.add(
      cmpGE(char.mindscape, 2, prod(hunters_gaze, dm.m2.crit_dmg_))
    ),
    undefined,
    true
  ),
  registerBuff(
    'm6_armor_break_rounds_dmg_',
    m6_armor_break_rounds_dmg_,
    undefined,
    undefined,
    false
  )
)
export default sheet
