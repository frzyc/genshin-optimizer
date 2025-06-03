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
  allNumConditionals,
  enemyDebuff,
  own,
  ownBuff,
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

const key: CharacterKey = 'Nicole'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]

const { char } = own

const { bulletsOrFieldHit } = allBoolConditionals(key)
const { fieldHitsEnemy } = allNumConditionals(key, true, 0, dm.m6.stacks)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    // Basic Cunning Combo is physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackCunningCombo',
      0,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackCunningCombo',
      1,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackCunningCombo',
      2,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackCunningCombo',
      3,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackCunningCombo',
      4,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackCunningCombo',
      5,
      { damageType1: 'basic' },
      'atk'
    ),
    // Dash Attack Jack In The Box is physical
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackJackInTheBox',
      0,
      { damageType1: 'dash' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackJackInTheBox',
      1,
      { damageType1: 'dash' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackJackInTheBox',
      2,
      { damageType1: 'dash' },
      'atk'
    )
  ),

  // Buffs
  registerBuff(
    'core_defRed_',
    enemyDebuff.common.defRed_.add(
      bulletsOrFieldHit.ifOn(subscript(char.core, dm.core.def_red_))
    )
  ),
  registerBuff(
    'ability_ether_dmg_',
    teamBuff.combat.common_dmg_.add(
      prod(
        min(
          sum(
            team.common.count.ether,
            team.common.count.withFaction('CunningHares')
          ),
          1
        ),
        bulletsOrFieldHit.ifOn(dm.ability.ether_dmg_)
      )
    )
  ),
  registerBuff(
    'm1_exSpecial_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'exSpecial',
      cmpGE(char.mindscape, 1, dm.m1.ex_special_dmg_anomBuildup)
    )
  ),
  registerBuff(
    'm1_exSpecial_anomBuildup_',
    ownBuff.combat.anomBuildup_.addWithDmgType(
      'exSpecial',
      cmpGE(char.mindscape, 1, dm.m1.ex_special_dmg_anomBuildup)
    )
  ),
  registerBuff(
    'm6_crit_',
    teamBuff.combat.crit_.add(
      cmpGE(char.mindscape, 6, prod(fieldHitsEnemy, dm.m6.crit_))
    ),
    undefined,
    true
  )
)
export default sheet
