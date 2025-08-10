import type { NumNode } from '@genshin-optimizer/pando/engine'
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
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'Yuzuha'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]

const { char } = own

const { tanuki_wish, sweet_scare, exSpecial_ult_hit } = allBoolConditionals(key)
const { powerful_shell_hits } = allNumConditionals(
  key,
  true,
  0,
  dm.m6.max_stacks
)

const ability_check = (node: NumNode) =>
  cmpGE(
    sum(
      team.common.count.withSpecialty('anomaly'),
      team.common.count.withFaction('SpookShack')
    ),
    1,
    node
  )

const basic_anomBuildup_ = ownBuff.combat.anomBuildup_.addWithDmgType(
  'basic',
  sum(percent(0.07), prod(char.basic, percent(0.015)))
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    // Basic Attack Hard Candy Shot is aftershock
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackHardCandyShot',
      0,
      {
        damageType1: 'basic',
        damageType2: 'aftershock',
      },
      'atk'
    ),
    // Per-hit buffs
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackSugarburstSparkles',
      0,
      { damageType1: 'basic' },
      'atk',
      undefined,
      ...basic_anomBuildup_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackSugarburstSparklesMax',
      0,
      { damageType1: 'basic' },
      'atk',
      undefined,
      ...basic_anomBuildup_
    )
  ),

  ...customDmg(
    'm6_dmg',
    { attribute: 'physical', damageType1: 'elemental' },
    cmpGE(char.mindscape, 6, prod(own.final.atk, percent(dm.m6.dmg)))
  ),

  // Buffs
  registerBuff(
    'basic_anomBuildup_',
    basic_anomBuildup_,
    undefined,
    false,
    false
  ),
  registerBuff(
    'core_atk',
    teamBuff.combat.atk.add(
      tanuki_wish.ifOn(
        min(
          subscript(char.core, dm.core.max_atk),
          prod(own.initial.atk, percent(dm.core.atk))
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'core_common_dmg_',
    teamBuff.combat.common_dmg_.add(tanuki_wish.ifOn(dm.core.common_dmg_)),
    undefined,
    true
  ),
  registerBuff(
    'ability_anomBuildup_',
    teamBuff.combat.anomBuildup_.add(
      ability_check(
        tanuki_wish.ifOn(
          min(
            prod(
              max(0, sum(own.final.anomMas, -dm.ability.anomMas_threshold)),
              percent(dm.ability.anomBuildup_)
            ),
            percent(dm.ability.max_anomBuildup_)
          )
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'ability_anomaly_buff_',
    teamBuff.combat.buff_.addWithDmgType(
      'anomaly',
      ability_check(
        tanuki_wish.ifOn(
          min(
            prod(
              max(0, sum(own.final.anomMas, -dm.ability.anomMas_threshold)),
              percent(dm.ability.anomaly_disorder_dmg_),
              cmpGE(char.mindscape, 1, percent(dm.m1.buffInc_), percent(1))
            ),
            prod(
              percent(dm.ability.max_anomaly_disorder_dmg_),
              cmpGE(char.mindscape, 1, percent(dm.m1.buffInc_), percent(1))
            )
          )
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'ability_disorder_buff_',
    teamBuff.combat.buff_.addWithDmgType(
      'disorder',
      ability_check(
        tanuki_wish.ifOn(
          min(
            prod(
              max(0, sum(own.final.anomMas, -dm.ability.anomMas_threshold)),
              percent(dm.ability.anomaly_disorder_dmg_),
              cmpGE(char.mindscape, 1, percent(dm.m1.buffInc_), percent(1))
            ),
            prod(
              percent(dm.ability.max_anomaly_disorder_dmg_),
              cmpGE(char.mindscape, 1, percent(dm.m1.buffInc_), percent(1))
            )
          )
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'm1_resRed_',
    enemyDebuff.common.resRed_.add(
      cmpGE(char.mindscape, 1, sweet_scare.ifOn(percent(dm.m1.resRed_)))
    ),
    undefined,
    true
  ),
  registerBuff(
    'm2_common_dmg_',
    teamBuff.combat.common_dmg_.add(
      cmpGE(
        char.mindscape,
        2,
        exSpecial_ult_hit.ifOn(percent(dm.m2.common_dmg_))
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'm2_anomBuildup_',
    teamBuff.combat.anomBuildup_.add(
      cmpGE(
        char.mindscape,
        2,
        exSpecial_ult_hit.ifOn(percent(dm.m2.anomBuildup_))
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'm4_assistFollowUp_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'assistFollowUp',
      cmpGE(char.mindscape, 4, percent(dm.m4.assistFollowUp_dmg_))
    )
  ),
  registerBuff(
    'm4_assistFollowUp_anomBuildup_',
    ownBuff.combat.anomBuildup_.addWithDmgType(
      'assistFollowUp',
      cmpGE(char.mindscape, 4, percent(dm.m4.assistFollowUp_anomBuildup_))
    )
  ),
  registerBuff(
    'm6_addl_disorder_',
    teamBuff.combat.addl_disorder_.add(
      cmpGE(
        char.mindscape,
        6,
        prod(powerful_shell_hits, percent(dm.m6.add_disorder_))
      )
    ),
    undefined,
    true
  )
)
export default sheet
