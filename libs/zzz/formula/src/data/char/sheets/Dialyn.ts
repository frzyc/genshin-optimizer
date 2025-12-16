import type { NumNode } from '@genshin-optimizer/pando/engine'
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

const key: CharacterKey = 'Dialyn'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]

const { char } = own

const { malicious_complaint, overwhelmingly_positive } =
  allBoolConditionals(key)

const ability_check = (a: NumNode | number, b?: NumNode | number) =>
  cmpGE(
    sum(
      team.common.count.withSpecialty('attack'),
      team.common.count.withSpecialty('rupture')
    ),
    1,
    a,
    b
  )

const ability_attack_dmg = ownBuff.combat.flat_dmg.addWithDmgType(
  'exSpecial',
  ability_check(prod(own.final.atk, percent(dm.ability.attack_dmg)))
)
const ability_rupture_dmg = ownBuff.combat.flat_dmg.addWithDmgType(
  'exSpecial',
  ability_check(prod(own.final.sheerForce, percent(dm.ability.rupture_dmg)))
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
      'EXSpecialAttackRock',
      0,
      { damageType1: 'exSpecial' },
      'atk',
      undefined,
      ...ability_attack_dmg,
      ...ability_rupture_dmg
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'EXSpecialAttackScissors',
      0,
      { damageType1: 'exSpecial' },
      'atk',
      undefined,
      ...ability_attack_dmg,
      ...ability_rupture_dmg
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'EXSpecialAttackPaper',
      0,
      { damageType1: 'exSpecial' },
      'atk',
      undefined,
      ...ability_attack_dmg,
      ...ability_rupture_dmg
    )
  ),

  ...customDmg(
    'm6_dmg',
    { attribute: 'physical', damageType1: 'exSpecial' },
    cmpGE(char.mindscape, 6, prod(own.final.atk, percent(dm.m6.dmg)))
  ),

  // Buffs
  registerBuff(
    'core_impact',
    ownBuff.combat.impact.add(
      min(
        dm.core.max_impact,
        prod(
          max(
            0,
            sum(own.final.crit_, prod(-1, percent(dm.core.crit_threshold)))
          ),
          subscript(char.core, dm.core.impact),
          constant(100)
        )
      )
    )
  ),
  registerBuff(
    'core_stun_',
    enemyDebuff.common.stun_.add(
      malicious_complaint.ifOn(percent(subscript(char.core, dm.core.stun_)))
    ),
    undefined,
    true
  ),
  registerBuff(
    'ability_exSpecial_crit_dmg_',
    ownBuff.combat.crit_dmg_.add(
      ability_check(percent(dm.ability.exSpecial_crit_dmg_))
    )
  ),
  registerBuff(
    'ability_common_dmg_',
    teamBuff.combat.common_dmg_.add(
      ability_check(
        overwhelmingly_positive.ifOn(percent(dm.ability.common_dmg_))
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'ability_attack_dmg',
    ability_attack_dmg,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'ability_rupture_dmg',
    ability_rupture_dmg,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'm1_resIgn_',
    teamBuff.combat.resIgn_.add(
      cmpGE(
        char.mindscape,
        1,
        ability_check(overwhelmingly_positive.ifOn(percent(dm.m1.resIgn_)))
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'm2_stun_',
    enemyDebuff.common.stun_.add(
      cmpGE(char.mindscape, 2, malicious_complaint.ifOn(percent(dm.m2.stun_)))
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
        malicious_complaint.ifOn(percent(dm.m2.common_dmg_))
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'm4_atk',
    ownBuff.combat.atk.add(
      cmpGE(
        char.mindscape,
        4,
        ability_check(overwhelmingly_positive.ifOn(percent(dm.m4.atk)))
      )
    )
  )
)
export default sheet
