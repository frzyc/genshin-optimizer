import {
  cmpGE,
  cmpLT,
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

const key: CharacterKey = 'Lucy'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { cheerOn } = allBoolConditionals(key)

const core_atk = ownBuff.combat.atk.add(
  cheerOn.ifOn(
    min(
      prod(
        600,
        sum(percent(subscript(char.core, dm.core.cheer_on)), percent(-1))
      ),
      prod(
        sum(
          prod(
            sum(percent(0.13), prod(char.special, percent(0.008))),
            own.initial.atk
          ),
          40,
          prod(char.special, 4)
        ),
        sum(percent(subscript(char.core, dm.core.cheer_on)), percent(-1))
      )
    )
  )
)
const ability_crit_ = ownBuff.final.crit_.add(
  cmpLT(
    sum(
      team.common.count.fire,
      team.common.count.withFaction('SonsOfCalydon'),
      team.common.count.withSpecialty('rupture')
    ),
    3,
    prod(-1, sum(own.initial.crit_, own.combat.crit_))
  )
)
const ability_crit_dmg_ = ownBuff.final.crit_dmg_.add(
  cmpLT(
    sum(
      team.common.count.fire,
      team.common.count.withFaction('SonsOfCalydon'),
      team.common.count.withSpecialty('rupture')
    ),
    3,
    prod(-1, sum(own.initial.crit_dmg_, own.combat.crit_dmg_))
  )
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    // Guard Boars attacks are physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'GuardBoarsToArms',
      0,
      { damageType1: 'basic' },
      'atk',
      undefined,
      core_atk,
      ability_crit_,
      ability_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'GuardBoarsToArms',
      1,
      { damageType1: 'basic' },
      'atk',
      undefined,
      core_atk,
      ability_crit_,
      ability_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'GuardBoarsToArms',
      2,
      { damageType1: 'basic' },
      'atk',
      undefined,
      core_atk,
      ability_crit_,
      ability_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'GuardBoarsSpinningSwing',
      0,
      { damageType1: 'basic' },
      'atk',
      undefined,
      core_atk,
      ability_crit_,
      ability_crit_dmg_
    ),
    // Basic attack 1-2 and 4 hits are physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackLadysBat',
      0,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackLadysBat',
      1,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackLadysBat',
      3,
      { damageType1: 'basic' },
      'atk'
    ),
    // Dash attacks is physical
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackFearlessBoar',
      0,
      { damageType1: 'dash' },
      'atk'
    )
  ),

  ...customDmg(
    'm6_dmg',
    { ...baseTag, damageType1: 'elemental' },
    prod(own.final.atk, percent(dm.m6.dmg)),
    undefined,
    core_atk,
    ability_crit_,
    ability_crit_dmg_
  ),

  // Buffs
  registerBuff(
    'exSpecial_atk',
    teamBuff.combat.atk.add(
      cheerOn.ifOn(
        min(
          600,
          sum(
            prod(
              sum(percent(0.13), prod(char.special, percent(0.008))),
              own.initial.atk
            ),
            40,
            prod(char.special, 4)
          )
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff('core_atk', core_atk, undefined, undefined, false),
  registerBuff('ability_crit_', ability_crit_, undefined, undefined, false),
  registerBuff(
    'ability_crit_dmg_',
    ability_crit_dmg_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'm4_crit_dmg_',
    teamBuff.combat.crit_dmg_.add(
      cmpGE(char.mindscape, 4, cheerOn.ifOn(percent(dm.m4.crit_dmg_)))
    ),
    undefined,
    true
  )
)
export default sheet
