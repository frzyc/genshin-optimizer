import { cmpGE, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  allNumConditionals,
  customSheerDmg,
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
  getBaseTag,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'Banyue'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { exSpecialBasicUsed, tremor } = allBoolConditionals(key)
const { vidyaraja } = allNumConditionals(key, true, 0, dm.ability.maxStacks)

const m1_exSpecial_sheer_dmg_ = ownBuff.combat.sheer_dmg_.addWithDmgType(
  'exSpecial',
  cmpGE(char.mindscape, 1, tremor.ifOn(percent(dm.m1.sheer_dmg_)))
)
const m1_basic_sheer_dmg_ = ownBuff.combat.sheer_dmg_.addWithDmgType(
  'basic',
  cmpGE(char.mindscape, 1, tremor.ifOn(percent(dm.m1.sheer_dmg_)))
)
const m4_exSpecial_dmg_ = ownBuff.combat.dmg_.addWithDmgType(
  'exSpecial',
  cmpGE(char.mindscape, 4, percent(dm.m4.dmg_))
)
const m4_basic_dmg_ = ownBuff.combat.dmg_.addWithDmgType(
  'basic',
  cmpGE(char.mindscape, 4, percent(dm.m4.dmg_))
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
      'basic',
      'BasicAttackTopplingMountain',
      0,
      {
        ...baseTag,
        damageType1: 'basic',
      },
      'sheerForce',
      undefined,
      ...m1_basic_sheer_dmg_,
      ...m4_basic_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackCrushingPeaks',
      0,
      {
        ...baseTag,
        damageType1: 'basic',
      },
      'sheerForce',
      undefined,
      ...m1_basic_sheer_dmg_,
      ...m4_basic_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'EXSpecialAttackLionsRoar',
      0,
      {
        ...baseTag,
        damageType1: 'exSpecial',
      },
      'sheerForce',
      undefined,
      ...m1_exSpecial_sheer_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'EXSpecialAttackLionsRoarWrath',
      0,
      {
        ...baseTag,
        damageType1: 'exSpecial',
      },
      'sheerForce',
      undefined,
      ...m1_exSpecial_sheer_dmg_,
      ...m4_exSpecial_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'EXSpecialAttackMountainTremor',
      0,
      {
        ...baseTag,
        damageType1: 'exSpecial',
      },
      'sheerForce',
      undefined,
      ...m1_exSpecial_sheer_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'EXSpecialAttackMountainTremorWrath',
      0,
      {
        ...baseTag,
        damageType1: 'exSpecial',
      },
      'sheerForce',
      undefined,
      ...m1_exSpecial_sheer_dmg_,
      ...m4_exSpecial_dmg_
    )
  ),

  ...customSheerDmg(
    'm6_dmg',
    { ...baseTag, damageType1: 'elemental' },
    cmpGE(char.mindscape, 6, prod(own.final.sheerForce, percent(dm.m6.dmg)))
  ),

  // Buffs
  registerBuff(
    'core_hpSheerForce',
    ownBuff.initial.sheerForce.add(
      prod(own.final.hp, dm.core.sheerForcePerStep)
    )
  ),
  registerBuff(
    'core_sheerForce',
    ownBuff.combat.sheerForce.add(
      exSpecialBasicUsed.ifOn(subscript(char.core, dm.core.sheerForce))
    )
  ),
  registerBuff(
    'core_fire_dmg_',
    ownBuff.combat.dmg_.fire.add(
      exSpecialBasicUsed.ifOn(percent(subscript(char.core, dm.core.fire_dmg_)))
    )
  ),
  registerBuff(
    'core_crit_dmg_',
    ownBuff.combat.crit_dmg_.add(
      exSpecialBasicUsed.ifOn(percent(subscript(char.core, dm.core.crit_dmg_)))
    )
  ),
  registerBuff(
    'ability_fire_dmg_',
    ownBuff.combat.dmg_.fire.add(
      cmpGE(
        sum(
          team.common.count.withSpecialty('support'),
          team.common.count.withSpecialty('stun'),
          cmpGE(char.mindscape, 6, 1)
        ),
        1,
        prod(
          vidyaraja,
          sum(
            percent(dm.ability.fire_dmg_),
            cmpGE(char.mindscape, 6, percent(dm.m6.fire_dmg_))
          )
        )
      )
    )
  ),
  registerBuff(
    'm1_fire_resRed_',
    enemyDebuff.common.resRed_.fire.add(
      cmpGE(char.mindscape, 1, tremor.ifOn(percent(dm.m1.fire_resRed_)))
    )
  ),
  registerBuff(
    'm1_basic_sheer_dmg_',
    m1_basic_sheer_dmg_,
    undefined,
    false,
    false
  ),
  registerBuff(
    'm1_exSpecial_sheer_dmg_',
    m1_exSpecial_sheer_dmg_,
    undefined,
    false,
    false
  ),
  registerBuff(
    'm2_crit_dmg_',
    ownBuff.combat.crit_dmg_.add(
      cmpGE(
        char.mindscape,
        2,
        exSpecialBasicUsed.ifOn(percent(dm.m2.crit_dmg_))
      )
    )
  ),
  registerBuff(
    'm2_fire_dmg_',
    ownBuff.combat.dmg_.fire.add(
      cmpGE(
        char.mindscape,
        2,
        exSpecialBasicUsed.ifOn(percent(dm.m2.fire_dmg_))
      )
    )
  ),
  registerBuff('m4_exSpecial_dmg_', m4_exSpecial_dmg_, undefined, false, false),
  registerBuff('m4_basic_dmg_', m4_basic_dmg_, undefined, false, false)
)
export default sheet
