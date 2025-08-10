import {
  cmpGE,
  max,
  min,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  customDmg,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
  teamBuff,
} from '../../util'
import {
  dmgDazeAndAnomOverride,
  entriesForChar,
  getBaseTag,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'JuFufu'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { tigers_roar, chain_hit } = allBoolConditionals(key)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    // Basic Attack 1-2 hits are physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackTigerSevenFormsFlamingClaw',
      0,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackTigerSevenFormsFlamingClaw',
      1,
      { damageType1: 'basic' },
      'atk'
    ),
    // Dash attack Tiger Seven Forms Tiger Charge is physical
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackTigerSevenFormsTigerCharge',
      0,
      { damageType1: 'dash' },
      'atk'
    ),
    // Dash Attack Tiger Seven Forms Mountain King's Game is physical
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackTigerSevenFormsMountainKingsGame',
      0,
      { damageType1: 'dash' },
      'atk'
    ),
    // Chain Attack Suppressing Tiger Cauldron is an aftershock
    dmgDazeAndAnomOverride(
      dm,
      'chain',
      'ChainAttackSuppressingTigerCauldron',
      0,
      { ...baseTag, damageType1: 'chain', damageType2: 'aftershock' },
      'atk'
    )
  ),

  ...customDmg(
    'm6_dmg',
    { damageType1: 'chain' },
    cmpGE(char.mindscape, 6, prod(own.final.atk, percent(dm.m6.dmg)))
  ),

  // Buffs
  registerBuff(
    'core_crit_dmg_',
    teamBuff.combat.crit_dmg_.add(
      tigers_roar.ifOn(
        sum(
          percent(subscript(char.core, dm.core.crit_dmg_)),
          min(
            percent(dm.core.max_crit_dmg_),
            prod(
              max(0, sum(own.final.atk, -dm.core.atk_threshold)),
              percent(dm.core.additional_crit_dmg_),
              percent(1 / dm.core.atk_step)
            )
          )
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'core_chain_dmg_',
    teamBuff.combat.dmg_.addWithDmgType(
      'chain',
      tigers_roar.ifOn(percent(subscript(char.core, dm.core.chain_dmg_)))
    ),
    undefined,
    true
  ),
  registerBuff(
    'core_ult_dmg_',
    teamBuff.combat.dmg_.addWithDmgType(
      'ult',
      tigers_roar.ifOn(percent(subscript(char.core, dm.core.ult_dmg_)))
    ),
    undefined,
    true
  ),
  registerBuff(
    'core_impact',
    ownBuff.combat.impact.add(
      tigers_roar.ifOn(percent(subscript(char.core, dm.core.impact)))
    )
  ),
  registerBuff(
    'm1_crit_',
    ownBuff.combat.crit_.add(cmpGE(char.mindscape, 1, percent(dm.m1.crit_)))
  ),
  registerBuff(
    'm1_stun_',
    enemyDebuff.common.stun_.add(
      cmpGE(char.mindscape, 1, chain_hit.ifOn(percent(dm.m1.stun_)))
    ),
    undefined,
    true
  ),
  registerBuff(
    'm2_crit_dmg_',
    teamBuff.combat.crit_dmg_.add(
      cmpGE(char.mindscape, 2, percent(dm.m2.crit_dmg_))
    ),
    undefined,
    true
  ),
  registerBuff(
    'm4_crit_dmg_',
    ownBuff.combat.crit_dmg_.add(
      cmpGE(char.mindscape, 4, percent(dm.m4.crit_dmg_))
    )
  ),
  registerBuff(
    'm6_chain_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'chain',
      cmpGE(char.mindscape, 6, percent(dm.m6.chain_dmg_))
    )
  )
)
export default sheet
