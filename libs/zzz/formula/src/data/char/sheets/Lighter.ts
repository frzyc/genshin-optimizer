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
  allNumConditionals,
  customDmg,
  enemyDebuff,
  notOwnBuff,
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

const key: CharacterKey = 'Lighter'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { morale_burst_hit, collapse } = allBoolConditionals(key)
const { morale_consumed } = allNumConditionals(key, true, 0, dm.core.max_morale)
const { elation } = allNumConditionals(key, true, 0, dm.ability.stacks)

const ability_ice_fire_dmg_check = cmpGE(
  sum(
    team.common.count.withSpecialty('attack'),
    team.common.count.withFaction('SonsOfCalydon')
  ),
  2,
  min(
    percent(dm.ability.max_ice_fire_dmg_),
    prod(
      prod(
        elation,
        sum(
          percent(dm.ability.ice_fire_dmg_),
          prod(
            max(0, sum(own.final.impact, -dm.ability.impact_threshold)),
            percent(1 / dm.ability.impact_step),
            percent(dm.ability.extra_ice_fire_dmg_)
          )
        )
      ),
      cmpGE(char.mindscape, 2, percent(dm.m2.ability_buff_inc_), percent(1))
    )
  )
)
const m6_finishing_move_dmg_ = ownBuff.combat.common_dmg_.add(
  cmpGE(char.mindscape, 1, percent(dm.m1.final_hit_dmg_))
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    // Dash Attack Charging Slam is physical
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackChargingSlam',
      0,
      {
        damageType1: 'dash',
      },
      'atk'
    ),
    // Per-hit buffs
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackLFormThunderingFist',
      15,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      m6_finishing_move_dmg_
    )
  ),

  ...customDmg(
    'm6_blazing_impact_dmg',
    { ...baseTag, damageType1: 'elemental' },
    cmpGE(
      char.mindscape,
      6,
      prod(
        own.final.atk,
        sum(
          percent(dm.m6.dmg),
          min(
            percent(dm.m6.max_dmg_mult_inc_),
            max(
              0,
              prod(
                sum(own.final.impact, -dm.m6.impact_threshold),
                percent(dm.m6.dmg_mult_inc_)
              )
            )
          )
        )
      )
    )
  ),

  // Buffs
  registerBuff(
    'core_impact_',
    ownBuff.combat.impact_.add(
      prod(morale_consumed, percent(subscript(char.core, dm.core.impact_)))
    )
  ),
  registerBuff(
    'core_ice_resRed_',
    enemyDebuff.common.resRed_.ice.add(
      morale_burst_hit.ifOn(dm.core.ice_fire_resRed_)
    )
  ),
  registerBuff(
    'core_fire_resRed_',
    enemyDebuff.common.resRed_.fire.add(
      morale_burst_hit.ifOn(dm.core.ice_fire_resRed_)
    )
  ),
  registerBuff(
    'ability_ice_dmg_',
    teamBuff.combat.dmg_.ice.add(ability_ice_fire_dmg_check),
    undefined,
    true
  ),
  registerBuff(
    'ability_fire_dmg_',
    teamBuff.combat.dmg_.fire.add(ability_ice_fire_dmg_check),
    undefined,
    true
  ),
  registerBuff(
    'm1_ice_resRed_',
    enemyDebuff.common.resRed_.ice.add(
      cmpGE(char.mindscape, 1, morale_burst_hit.ifOn(dm.m1.ice_fire_resRed_))
    )
  ),
  registerBuff(
    'm1_fire_resRed_',
    enemyDebuff.common.resRed_.fire.add(
      cmpGE(char.mindscape, 1, morale_burst_hit.ifOn(dm.m1.ice_fire_resRed_))
    )
  ),
  registerBuff(
    'm2_stun_',
    enemyDebuff.common.stun_.add(
      cmpGE(char.mindscape, 2, collapse.ifOn(percent(dm.m2.stun_)))
    )
  ),
  registerBuff(
    'm4_enerRegen_',
    notOwnBuff.combat.enerRegen_.add(
      cmpGE(char.mindscape, 4, percent(dm.m4.enerRegen_))
    ),
    undefined,
    true
  ),
  registerBuff(
    'm6_finishing_move_dmg_',
    m6_finishing_move_dmg_,
    undefined,
    undefined,
    true
  )
)
export default sheet
