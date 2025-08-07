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
  dmgDazeAndAnomMerge,
  dmgDazeAndAnomOverride,
  entriesForChar,
  getBaseTag,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'Soukaku'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { masked, flyTheFlag, vortexConsumed, flyTheFlagHit, frostedBanner } =
  allBoolConditionals(key)

const m6_dmg_ = ownBuff.combat.common_dmg_.add(
  cmpGE(char.mindscape, 6, frostedBanner.ifOn(percent(dm.m6.dmg_)))
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
      // Assist followup needs to be merged
      assist: {
        AssistFollowUpSweepingStrike: {
          '0': dmgDazeAndAnomMerge(
            [
              dm.assist.AssistFollowUpSweepingStrike[0],
              dm.assist.AssistFollowUpSweepingStrike[1],
            ],
            'AssistFollowUpSweepingStrike_0',
            { ...baseTag, damageType1: 'assistFollowUp' },
            'atk',
            'assist'
          ),
          '1': [],
        },
      },
    },
    // Basic attack making rice cakes is physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackMakingRiceCakes',
      0,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackMakingRiceCakes',
      1,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackMakingRiceCakes',
      2,
      { damageType1: 'basic' },
      'atk'
    ),
    // Dash attack is physical
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttack5050',
      0,
      { damageType1: 'dash' },
      'atk'
    ),
    // Per-hit buffs
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackMakingRiceCakesFrostedBanner',
      0,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      m6_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackMakingRiceCakesFrostedBanner',
      1,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      m6_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackMakingRiceCakesFrostedBanner',
      2,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      m6_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttack5050FrostedBanner',
      0,
      { ...baseTag, damageType1: 'dash' },
      'atk',
      undefined,
      m6_dmg_
    )
  ),

  // Buffs
  registerBuff(
    'ult_crit_',
    ownBuff.combat.crit_.add(masked.ifOn(percent(0.15))) // No data in dm
  ),
  registerBuff(
    'core_atk',
    teamBuff.combat.atk.add(
      flyTheFlag.ifOn(
        min(
          vortexConsumed.ifOn(dm.core.max_atk_more, dm.core.max_atk),
          prod(
            own.initial.atk,
            percent(subscript(char.core, dm.core.atk_)),
            vortexConsumed.ifOn(2, 1)
          )
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'ability_ice_dmg_',
    teamBuff.combat.dmg_.ice.add(
      cmpGE(
        sum(
          team.common.count.ice,
          team.common.count.withFaction('HollowSpecialOoperationsSection6')
        ),
        3,
        vortexConsumed.ifOn(percent(dm.ability.ice_dmg_))
      )
    )
  ),
  registerBuff(
    'm4_ice_resRed_',
    enemyDebuff.common.resRed_.ice.add(
      cmpGE(char.mindscape, 4, flyTheFlagHit.ifOn(percent(dm.m4.ice_resRed_)))
    ),
    undefined,
    true
  ),
  registerBuff('m6_common_dmg_', m6_dmg_, undefined, undefined, false)
)
export default sheet
