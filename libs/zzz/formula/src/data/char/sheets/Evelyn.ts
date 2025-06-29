import { cmpGE, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  customDmg,
  customShield,
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

const key: CharacterKey = 'Evelyn'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { binding_seal, enemy_bound, m4_shield_exists } = allBoolConditionals(key)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    // Basic Attack Razor Wire hits 1-3 are physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackRazorWire',
      0,
      {
        damageType1: 'basic',
      },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackRazorWire',
      1,
      {
        damageType1: 'basic',
      },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackRazorWire',
      2,
      {
        damageType1: 'basic',
      },
      'atk'
    ),
    // Dash Attack Piercing Ambush is physical
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackPiercingAmbush',
      0,
      { damageType1: 'dash' },
      'atk'
    )
  ),

  ...customShield(
    'm4_shield',
    cmpGE(char.mindscape, 4, prod(own.final.hp, percent(dm.m4.shield))),
    { cond: cmpGE(char.mindscape, 4, 'infer', '') }
  ),
  ...customDmg(
    'm6_follow_up_dmg_',
    { ...baseTag, skillType: 'chainSkill' },
    cmpGE(char.mindscape, 6, prod(own.final.atk, percent(dm.m6.dmg))),
    { cond: cmpGE(char.mindscape, 6, 'infer', '') }
  ),

  // Buffs
  registerBuff(
    'core_crit_',
    ownBuff.combat.crit_.add(
      binding_seal.ifOn(subscript(char.core, dm.core.crit_))
    )
  ),
  registerBuff(
    'ability_chain_ult_dmg_',
    ownBuff.combat.dmg_.chainSkill.add(
      cmpGE(
        sum(
          team.common.count.withSpecialty('stun'),
          team.common.count.withSpecialty('support')
        ),
        1,
        dm.ability.chain_ult_dmg_
      )
    )
  ),
  registerBuff(
    'ability_chainSkill_mv_mult',
    ownBuff.dmg.mv_mult_.chainSkill.add(
      cmpGE(
        sum(
          team.common.count.withSpecialty('stun'),
          team.common.count.withSpecialty('support')
        ),
        1,
        cmpGE(
          own.final.crit_,
          percent(dm.ability.crit_threshold),
          percent(dm.ability.dmg_mult_)
        )
      )
    )
  ),
  registerBuff(
    'm1_defIgn_',
    ownBuff.combat.defIgn_.add(
      cmpGE(char.mindscape, 1, enemy_bound.ifOn(dm.m1.defIgn_))
    ),
    cmpGE(char.mindscape, 1, 'infer', '')
  ),
  registerBuff(
    'm2_atk_',
    ownBuff.combat.atk_.add(cmpGE(char.mindscape, 2, dm.m2.atk_)),
    cmpGE(char.mindscape, 2, 'infer', '')
  ),
  registerBuff(
    'm4_crit_dmg_',
    ownBuff.combat.crit_dmg_.add(
      cmpGE(char.mindscape, 4, m4_shield_exists.ifOn(dm.m4.crit_dmg_))
    ),
    cmpGE(char.mindscape, 4, 'infer', '')
  )
)
export default sheet
