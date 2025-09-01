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
  allListConditionals,
  allNumConditionals,
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

const key: CharacterKey = 'Yanagi'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const {
  exSpecial_used,
  basic_hit,
  jougen,
  kagen,
  clarity,
  exposed,
  shinrabanshou,
} = allBoolConditionals(key)
const { thrusts } = allNumConditionals(key, true, 0, dm.m6.max_stacks)
const { polarityDisorder } = allListConditionals(key, ['exSpecial', 'ult'])

const m2_exSpecial_electric_anomBuildup_ =
  ownBuff.combat.anomBuildup_.electric.addWithDmgType(
    'exSpecial',
    cmpGE(char.mindscape, 2, percent(dm.m2.electric_anomBuildup_))
  )

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    // Basic Jougen 1-2 hits are physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'StanceJougen',
      0,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'StanceJougen',
      1,
      { damageType1: 'basic' },
      'atk'
    ),
    // Basic Kagen 1-2 hits are physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'StanceKagen',
      0,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'StanceKagen',
      1,
      { damageType1: 'basic' },
      'atk'
    ),
    // Dash attack is physical
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackFleetingFlight',
      0,
      { damageType1: 'basic' },
      'atk'
    ),
    // Per-hit buffs
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'EXSpecialAttackGekkaRuten',
      0,
      { ...baseTag, damageType1: 'exSpecial' },
      'atk',
      undefined,
      ...m2_exSpecial_electric_anomBuildup_
    )
  ),

  // Buffs
  registerBuff(
    'basic_electric_dmg_',
    ownBuff.combat.dmg_.electric.add(jougen.ifOn(percent(0.1)))
  ),
  registerBuff('basic_pen_', ownBuff.combat.pen_.add(kagen.ifOn(percent(0.1)))),
  registerBuff(
    'exSpecial_anom_base_',
    ownBuff.combat.anom_base_.addWithDmgType(
      'disorder',
      cmpEq(
        polarityDisorder.value,
        1,
        cmpGE(
          char.mindscape,
          2,
          sum(
            prod(-1, sum(percent(1), percent(-dm.m2.polarity_disorder_mv_))),
            prod(thrusts, percent(dm.m2.add_polarity_disorder_mv_))
          ),
          percent(-0.85)
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'ult_anom_base_',
    teamBuff.combat.anom_base_.addWithDmgType(
      'disorder',
      cmpEq(
        polarityDisorder.value,
        2,
        cmpGE(
          char.mindscape,
          2,
          sum(
            prod(-1, sum(percent(1), percent(-dm.m2.polarity_disorder_mv_))),
            prod(thrusts, percent(dm.m2.add_polarity_disorder_mv_))
          ),
          percent(-0.85)
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'exSpecial_anom_flat_dmg',
    teamBuff.combat.anom_flat_dmg.addWithDmgType(
      'disorder',
      cmpEq(
        polarityDisorder.value,
        1,
        prod(
          sum(percent(5), prod(char.special, percent(2.25))),
          own.final.anomProf
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'ult_anom_flat_dmg',
    teamBuff.combat.anom_flat_dmg.addWithDmgType(
      'disorder',
      cmpEq(
        polarityDisorder.value,
        2,
        prod(
          sum(percent(5), prod(char.chain, percent(2.25))),
          own.final.anomProf
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'core_addl_disorder_',
    teamBuff.combat.addl_disorder_.add(
      exSpecial_used.ifOn(percent(subscript(char.core, dm.core.addl_disorder_)))
    ),
    undefined,
    true
  ),
  registerBuff(
    'core_electric_dmg_',
    ownBuff.combat.dmg_.electric.add(
      exSpecial_used.ifOn(percent(subscript(char.core, dm.core.electric_dmg_)))
    )
  ),
  registerBuff(
    'ability_electric_anomBuildup_',
    teamBuff.combat.anomBuildup_.electric.add(
      cmpGE(
        sum(
          team.common.count.withSpecialty('anomaly'),
          team.common.count.electric
        ),
        3,
        basic_hit.ifOn(percent(dm.ability.electric_anomBuildup_))
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'm1_anomProf',
    ownBuff.combat.anomProf.add(
      cmpGE(char.mindscape, 1, clarity.ifOn(percent(dm.m1.anomProf)))
    )
  ),
  registerBuff(
    'm2_electric_anomBuildup_',
    m2_exSpecial_electric_anomBuildup_,
    undefined,
    false,
    false
  ),
  registerBuff(
    'm4_pen_',
    teamBuff.combat.pen_.add(
      cmpGE(char.mindscape, 4, exposed.ifOn(percent(dm.m4.pen_)))
    ),
    undefined,
    true
  ),
  registerBuff(
    'm6_exSpecial_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'exSpecial',
      shinrabanshou.ifOn(percent(dm.m6.exSpecial_dmg_))
    )
  )
)
export default sheet
