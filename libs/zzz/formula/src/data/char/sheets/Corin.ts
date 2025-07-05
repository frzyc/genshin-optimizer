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

const key: CharacterKey = 'Corin'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]

const { char } = own

const { chain_ult_hit } = allBoolConditionals(key)
const { exSpecial_chain_ult_hits } = allNumConditionals(
  key,
  true,
  0,
  dm.m2.stacks
)
const { charge } = allNumConditionals(key, true, 0, dm.m6.stacks)

const core_common_dmg_ = ownBuff.combat.common_dmg_.add(
  percent(subscript(char.core, dm.core.extended_slash_dmg_))
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    // Per-hit buffs
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackWipeout',
      2,
      { damageType1: 'basic' },
      'atk',
      undefined,
      core_common_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackWipeout',
      4,
      { damageType1: 'basic' },
      'atk',
      undefined,
      core_common_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackOopsyDaisy',
      0,
      { damageType1: 'dash' },
      'atk',
      undefined,
      core_common_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DodgeCounterNope',
      1,
      { damageType1: 'dodgeCounter' },
      'atk',
      undefined,
      core_common_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'SpecialAttackCleanSweep',
      1,
      { damageType1: 'special' },
      'atk',
      undefined,
      core_common_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'EXSpecialAttackSkirtAlert',
      1,
      { damageType1: 'exSpecial' },
      'atk',
      undefined,
      core_common_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'chain',
      'ChainAttackSorry',
      0,
      { damageType1: 'chain' },
      'atk',
      undefined,
      core_common_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'chain',
      'UltimateVeryVerySorry',
      0,
      { damageType1: 'ult' },
      'atk',
      undefined,
      core_common_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'assist',
      'QuickAssistEmergencyMeasures',
      1,
      { damageType1: 'quickAssist' },
      'atk',
      undefined,
      core_common_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'assist',
      'AssistFollowUpQuickSweep',
      0,
      { damageType1: 'assistFollowUp' },
      'atk',
      undefined,
      core_common_dmg_
    )
  ),

  ...customDmg(
    'm6_dmg',
    { damageType1: 'elemental' },
    cmpGE(char.mindscape, 6, prod(own.final.atk, percent(dm.m6.dmg), charge))
  ),

  // Buffs
  registerBuff(
    'core_common_dmg_',
    core_common_dmg_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'ability_common_dmg_',
    ownBuff.combat.common_dmg_.add(
      cmpGE(
        sum(
          team.common.count.physical,
          team.common.count.withFaction('VictoriaHousekeepingCo')
        ),
        3,
        cmpEq(enemy.common.isStunned, 1, percent(dm.ability.common_dmg_))
      )
    )
  ),
  registerBuff(
    'm1_common_dmg_',
    ownBuff.combat.common_dmg_.add(
      cmpGE(char.mindscape, 1, chain_ult_hit.ifOn(percent(dm.m1.common_dmg_)))
    )
  ),
  registerBuff(
    'm2_physical_resRed_',
    enemyDebuff.common.resRed_.physical.add(
      cmpGE(
        char.mindscape,
        2,
        prod(exSpecial_chain_ult_hits, percent(dm.m2.physical_resRed_))
      )
    )
  )
)
export default sheet
