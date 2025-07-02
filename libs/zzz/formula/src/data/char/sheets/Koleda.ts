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

const key: CharacterKey = 'Koleda'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { quick_use } = allBoolConditionals(key)
const { exSpecial_debuff } = allNumConditionals(key, true, 0, dm.ability.stacks)
const { charge } = allNumConditionals(key, true, 0, dm.m4.stacks)

const core_dazeInc_ = ownBuff.combat.dazeInc_.add(
  percent(subscript(char.core, dm.core.dazeInc_))
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    // Basic Attack 1-4 hits are physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackSmashNBash',
      0,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackSmashNBash',
      1,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackSmashNBash',
      2,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackSmashNBash',
      3,
      { damageType1: 'basic' },
      'atk'
    ),
    // Dash Attack is physical
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackTremble',
      0,
      { damageType1: 'dash' },
      'atk'
    ),
    // Per-hit buffs
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackSmashNBash',
      4,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      core_dazeInc_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackSmashNBash',
      5,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      core_dazeInc_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackSmashNBash',
      6,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      core_dazeInc_
    )
  ),

  ...customDmg(
    'm6_dmg',
    { damageType1: 'elemental' },
    prod(own.final.atk, percent(dm.m6.dmg))
  ),

  // Buffs
  registerBuff(
    'core_exSpecial_dazeInc_',
    ownBuff.combat.dazeInc_.addWithDmgType(
      'exSpecial',
      percent(subscript(char.core, dm.core.dazeInc_))
    )
  ),
  registerBuff('core_dazeInc_', core_dazeInc_, undefined, undefined, false),
  registerBuff(
    'ability_chain_dmg_',
    teamBuff.combat.dmg_.addWithDmgType(
      'chain',
      cmpGE(
        sum(
          team.common.count.fire,
          team.common.count.withFaction('BelebogHeavyIndustries'),
          team.common.count.withSpecialty('rupture')
        ),
        3,
        cmpEq(
          enemy.common.isStunned,
          1,
          prod(exSpecial_debuff, percent(dm.ability.chain_dmg_))
        )
      )
    )
  ),
  registerBuff(
    'm1_special_dazeInc_',
    ownBuff.combat.dazeInc_.addWithDmgType(
      'special',
      cmpGE(char.mindscape, 1, quick_use.ifOn(percent(dm.m1.dazeInc_)))
    )
  ),
  registerBuff(
    'm1_exSpecial_dazeInc_',
    ownBuff.combat.dazeInc_.addWithDmgType(
      'exSpecial',
      cmpGE(char.mindscape, 1, quick_use.ifOn(percent(dm.m1.dazeInc_)))
    )
  ),
  registerBuff(
    'm4_chain_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'chain',
      cmpGE(char.mindscape, 4, prod(charge, percent(dm.m4.chain_ult_dmg_)))
    )
  ),
  registerBuff(
    'm4_ult_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'ult',
      cmpGE(char.mindscape, 4, prod(charge, percent(dm.m4.chain_ult_dmg_)))
    )
  )
)
export default sheet
