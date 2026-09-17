import {
  cmpEq,
  cmpGE,
  cmpNE,
  constant,
  max,
  min,
  type NumNode,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import { windswept } from '../../common/anomaly'
import {
  allBoolConditionals,
  enemyDebuff,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
  target,
  team,
  teamBuff,
} from '../../util'
import {
  dmgDazeAndAnomOverride,
  entriesForChar,
  getBaseTag,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'Roxy'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { contamination, enemyHit, exSpecialUsed, kindlyHits, chillHits } =
  allBoolConditionals(key)

const abilityCheck = (a: NumNode, b?: NumNode) =>
  cmpGE(
    sum(
      team.common.count.withSpecialty('attack'),
      team.common.count.withSpecialty('rupture'),
      team.common.count.withSpecialty('armorer')
    ),
    1,
    a,
    b
  )

const m2_exSpecial_dazeInc_ = ownBuff.combat.dazeInc_.addWithDmgType(
  'exSpecial',
  cmpGE(char.mindscape, 2, percent(dm.m2.dazeInc_))
)
const m6_special_mv_mult_ = ownBuff.dmg.mv_mult_.addWithDmgType(
  'special',
  cmpGE(char.mindscape, 6, percent(dm.m6.mv_mult_))
)
const m6_special_dazeInc_ = ownBuff.combat.dazeInc_.addWithDmgType(
  'special',
  cmpGE(char.mindscape, 6, percent(dm.m6.dazeInc_))
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'EXSpecialAttackDontCatchAChill',
      0,
      {
        ...baseTag,
        damageType1: 'exSpecial',
        skillType: 'specialSkill',
      },
      'atk',
      undefined,
      ...m2_exSpecial_dazeInc_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'EXSpecialAttackDontCatchAChill',
      1,
      {
        ...baseTag,
        damageType1: 'exSpecial',
        skillType: 'specialSkill',
      },
      'atk',
      undefined,
      ...m2_exSpecial_dazeInc_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'EyeOfTheStorm',
      2,
      { ...baseTag, damageType1: 'special', skillType: 'specialSkill' },
      'atk',
      undefined,
      ...m6_special_mv_mult_,
      ...m6_special_dazeInc_
    )
  ),

  // Buffs
  registerBuff(
    'core_atk',
    ownBuff.combat.atk.add(
      min(
        subscript(char.core, dm.core.maxAtk),
        prod(
          max(0, sum(own.initial.enerRegen, -dm.core.initEnerRegen)),
          dm.core.enerRegenStep,
          dm.core.atk
        )
      )
    )
  ),
  registerBuff(
    'core_impact',
    ownBuff.combat.impact.add(
      min(
        subscript(char.core, dm.core.maxImpact),
        prod(
          max(0, sum(own.initial.enerRegen, -dm.core.initEnerRegen)),
          dm.core.enerRegenStep,
          dm.core.impact
        )
      )
    )
  ),
  registerBuff(
    'core_crit_dmg_',
    teamBuff.combat.crit_dmg_.add(
      contamination.ifOn(
        cmpNE(
          target.char.specialty,
          'armorer',
          min(
            percent(subscript(char.core, dm.core.max_crit_dmg_)),
            prod(own.final.crit_, constant(100), percent(dm.core.crit_dmg_))
          )
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'core_laceration_dmg_',
    teamBuff.combat.crit_dmg_.add(
      contamination.ifOn(
        cmpEq(
          target.char.specialty,
          'armorer',
          min(
            percent(subscript(char.core, dm.core.max_laceration_dmg_)),
            prod(
              own.final.crit_,
              constant(100),
              percent(dm.core.laceration_dmg_)
            )
          )
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'ability_common_dmg_',
    ownBuff.combat.common_dmg_.add(
      abilityCheck(
        sum(
          percent(dm.ability.common_dmg_),
          prod(char.lvl, percent(dm.ability.dmg_step))
        )
      )
    )
  ),
  registerBuff(
    'ability_stun_',
    enemyDebuff.common.stun_.add(
      abilityCheck(enemyHit.ifOn(percent(dm.ability.stun_)))
    ),
    undefined,
    true
  ),
  registerBuff(
    'ability_direct_dmg_',
    teamBuff.combat.direct_dmg_.add(
      abilityCheck(windswept.ifOn(percent(dm.ability.direct_dmg_)))
    ),
    undefined,
    true
  ),
  registerBuff(
    'ability_anomBuildup_',
    ownBuff.combat.anomBuildup_.add(
      abilityCheck(exSpecialUsed.ifOn(percent(dm.ability.anomBuildup_)))
    )
  ),
  registerBuff(
    'm1_resRed_',
    enemyDebuff.common.resRed_.add(
      cmpGE(char.mindscape, 1, kindlyHits.ifOn(percent(dm.m1.resRed_)))
    ),
    undefined,
    true
  ),
  registerBuff(
    'm1_crit_dmg_',
    ownBuff.combat.crit_dmg_.add(
      cmpGE(char.mindscape, 1, percent(dm.m1.crit_dmg_))
    )
  ),
  registerBuff(
    'm2_exSpecial_dazeInc_',
    m2_exSpecial_dazeInc_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'm2_stun_',
    enemyDebuff.common.stun_.add(
      cmpGE(char.mindscape, 2, chillHits.ifOn(percent(dm.m2.stun_)))
    )
  ),
  registerBuff(
    'm4_ult_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'ult',
      cmpGE(char.mindscape, 4, percent(dm.m4.dmg_))
    )
  ),
  registerBuff(
    'm4_ult_dazeInc_',
    ownBuff.combat.dazeInc_.addWithDmgType(
      'ult',
      cmpGE(char.mindscape, 4, percent(dm.m4.dazeInc_))
    )
  ),
  registerBuff(
    'm6_wind_resIgn_',
    ownBuff.combat.resIgn_.wind.add(
      cmpGE(char.mindscape, 6, percent(dm.m6.windResIgn_))
    )
  ),
  registerBuff(
    'm6_special_mv_mult_',
    m6_special_mv_mult_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'm6_special_dazeInc_',
    m6_special_dazeInc_,
    undefined,
    undefined,
    false
  )
)
export default sheet
