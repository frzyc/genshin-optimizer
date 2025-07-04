import { cmpGE, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
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
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'Piper'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]

const { char } = own

const { power } = allNumConditionals(key, true, 0, dm.core.stacks)
const { extraPower } = allNumConditionals(key, true, 0, 10)
const totalPower = sum(power, cmpGE(char.mindscape, 1, extraPower))

const m2_physical_dmg_ = ownBuff.combat.dmg_.physical.add(
  cmpGE(
    char.mindscape,
    2,
    sum(
      percent(dm.m2.physical_dmg_),
      prod(totalPower, percent(dm.m2.extra_physical_dmg_))
    )
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
    // Per-hit buffs
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'SpecialAttackOneTrillionTons',
      0,
      { damageType1: 'special' },
      'atk',
      undefined,
      m2_physical_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'SpecialAttackOneTrillionTons',
      1,
      { damageType1: 'special' },
      'atk',
      undefined,
      m2_physical_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'SpecialAttackOneTrillionTons',
      2,
      { damageType1: 'special' },
      'atk',
      undefined,
      m2_physical_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'EXSpecialAttackReallyHeavy',
      0,
      { damageType1: 'exSpecial' },
      'atk',
      undefined,
      m2_physical_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'chain',
      'UltimateHoldOnTight',
      0,
      { damageType1: 'ult' },
      'atk',
      undefined,
      m2_physical_dmg_
    )
  ),

  // Buffs
  registerBuff(
    'core_physical_anomBuildup_',
    ownBuff.combat.anomBuildup_.physical.add(
      prod(
        totalPower,
        percent(subscript(char.core, dm.core.physical_anomBuildup_))
      )
    )
  ),
  registerBuff(
    'ability_common_dmg_',
    teamBuff.combat.common_dmg_.add(
      cmpGE(
        sum(
          team.common.count.physical,
          team.common.count.withFaction('SonsOfCalydon')
        ),
        2,
        cmpGE(totalPower, dm.ability.stack_threshold, dm.ability.common_dmg_)
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'm2_physical_dmg_',
    m2_physical_dmg_,
    undefined,
    undefined,
    false
  )
)
export default sheet
