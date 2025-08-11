import {
  cmpGE,
  constant,
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
  enemy,
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

const key: CharacterKey = 'Alice'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]

const { char } = own

const { physical_anomaly_inflicted, assault_triggered } =
  allBoolConditionals(key)

const m4_basic_anomBuildup_ = ownBuff.combat.anomBuildup_.addWithDmgType(
  'basic',
  cmpGE(char.mindscape, 4, percent(dm.m4.physical_anomBuildup_))
)
const m6_crit_ = ownBuff.combat.crit_.add(cmpGE(char.mindscape, 6, percent(1)))

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
      'BasicAttackCelestialOverture',
      0,
      { damageType1: 'basic' },
      'atk',
      undefined,
      ...m4_basic_anomBuildup_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackCelestialOverture',
      1,
      { damageType1: 'basic' },
      'atk',
      undefined,
      ...m4_basic_anomBuildup_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackCelestialOverture',
      2,
      { damageType1: 'basic' },
      'atk',
      undefined,
      ...m4_basic_anomBuildup_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackCelestialOverture',
      3,
      { damageType1: 'basic' },
      'atk',
      undefined,
      ...m4_basic_anomBuildup_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackCelestialOverture',
      4,
      { damageType1: 'basic' },
      'atk',
      undefined,
      ...m4_basic_anomBuildup_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackCelestialOverture',
      5,
      { damageType1: 'basic' },
      'atk',
      undefined,
      ...m4_basic_anomBuildup_
    )
  ),

  ...customDmg(
    'm6_dmg',
    { attribute: 'physical', damageType1: 'elemental' },
    cmpGE(char.mindscape, 6, prod(own.final.anomProf, percent(dm.m6.dmg))),
    undefined,
    m6_crit_
  ),

  // Buffs
  registerBuff(
    'core_anom_mv_mult_',
    teamBuff.dmg.anom_mv_mult_.physical.add(
      physical_anomaly_inflicted.ifOn(percent(dm.core.dmg))
    ),
    undefined,
    true
  ),
  registerBuff(
    'core_addl_disorder_',
    teamBuff.combat.addl_disorder_.physical.add(
      min(
        prod(
          sum(constant(10), prod(enemy.common.anomTimePassed, constant(-1))),
          percent(dm.core.addl_disorder_)
        ),
        percent(dm.core.max_addl_disorder_)
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'core_physical_anomBuildup_',
    ownBuff.combat.anomBuildup_.physical.add(
      assault_triggered.ifOn(
        percent(subscript(char.core, dm.core.physical_anomBuildup_))
      )
    )
  ),
  registerBuff(
    'ability_anomProf',
    ownBuff.combat.anomProf.add(
      cmpGE(
        sum(
          team.common.count.withSpecialty('anomaly'),
          team.common.count.withSpecialty('support')
        ),
        2,
        prod(
          max(0, sum(own.final.anomMas, -dm.ability.anomMas_threshold)),
          percent(dm.ability.anomProf)
        )
      )
    )
  ),
  registerBuff(
    'm1_defRed_',
    enemyDebuff.common.defRed_.add(
      cmpGE(char.mindscape, 1, assault_triggered.ifOn(percent(dm.m1.defRed_)))
    ),
    undefined,
    true
  ),
  registerBuff(
    'm2_physical_anomaly_buff_',
    teamBuff.combat.buff_.physical.addWithDmgType(
      'anomaly',
      cmpGE(char.mindscape, 2, percent(dm.m2.physical_buff_))
    ),
    undefined,
    true
  ),
  registerBuff(
    'm2_physical_disorder_buff_',
    teamBuff.combat.buff_.physical.addWithDmgType(
      'disorder',
      cmpGE(char.mindscape, 2, percent(dm.m2.disorder_buff_))
    ),
    undefined,
    true
  ),
  registerBuff(
    'm4_physical_resIgn_',
    ownBuff.combat.resIgn_.physical.add(
      cmpGE(char.mindscape, 4, percent(dm.m4.physical_resIgn_))
    )
  ),
  registerBuff(
    'm4_basic_anomBuildup_',
    m4_basic_anomBuildup_,
    undefined,
    undefined,
    false
  ),
  registerBuff('m6_crit_', m6_crit_, undefined, undefined, false)
)
export default sheet
