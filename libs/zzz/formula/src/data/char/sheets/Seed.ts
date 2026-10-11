import type { NumNode } from '@genshin-optimizer/pando/engine'
import {
  cmpEq,
  cmpGE,
  cmpNE,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  allNumConditionals,
  customDmg,
  member0,
  member1,
  member2,
  notOwnBuff,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
  target,
  team,
} from '../../util'
import {
  dmgDazeAndAnomOverride,
  entriesForChar,
  getBaseTag,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'Seed'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { directStrike, onslaught, directStrikeDisplay } =
  allBoolConditionals(key)
const { energy_consumed } = allNumConditionals(
  key,
  true,
  0,
  dm.m2.max_energy_consumed - dm.m2.energy_consumed
)

// Kit: Attack teammate with the highest initial ATK is Vanguard.
// Rank Attack non-Seed member slots by initial ATK, then apply when target matches
// that slot's key. Sheet `key` excludes Seed so she cannot claim Vanguard.
type MemberRead = typeof member0
const atkBeatsOrTiesAttackTeammate = (a: MemberRead, b: MemberRead) =>
  // Non-Attack / Seed / same unit → ok (1). Else need a.initial.atk >= b.initial.atk.
  cmpEq(
    b.char.specialty,
    'attack',
    cmpNE(
      b.char.key,
      key,
      cmpNE(
        b.char.key,
        a.char.key,
        cmpGE(a.initial.atk, b.initial.atk, 1, 0),
        1
      ),
      1
    ),
    1
  )
const isVanguardMember = (m: MemberRead) =>
  cmpGE(
    sum(
      cmpEq(m.char.specialty, 'attack', 1),
      cmpNE(m.char.key, key, 1),
      atkBeatsOrTiesAttackTeammate(m, member0),
      atkBeatsOrTiesAttackTeammate(m, member1),
      atkBeatsOrTiesAttackTeammate(m, member2)
    ),
    5,
    1
  )
const isTargetVanguard = sum(
  cmpEq(target.char.key, member0.char.key, isVanguardMember(member0)),
  cmpEq(target.char.key, member1.char.key, isVanguardMember(member1)),
  cmpEq(target.char.key, member2.char.key, isVanguardMember(member2))
)
const directStrikeCheck = (node: NumNode | number) =>
  cmpGE(isTargetVanguard, 1, node)
const besiege = (node: NumNode | number) =>
  directStrike.ifOn(onslaught.ifOn(node))
const besiegeDisplay = (node: NumNode | number) =>
  directStrikeDisplay.ifOn(onslaught.ifOn(node))
const abilityCheck = (node: NumNode | number) =>
  cmpGE(team.common.count.withSpecialty('attack'), 2, node)

const ability_basic_dmg_ = ownBuff.combat.dmg_.addWithDmgType(
  'basic',
  abilityCheck(percent(dm.ability.basic_ult_dmg_))
)
const ability_basic_electric_resIgn_ =
  ownBuff.combat.resIgn_.electric.addWithDmgType(
    'basic',
    abilityCheck(percent(dm.ability.electric_resIgn_))
  )
const m1_basic_crit_dmg_ = ownBuff.combat.crit_dmg_.addWithDmgType(
  'basic',
  cmpGE(char.mindscape, 1, percent(dm.m1.basic_crit_dmg_))
)

const sheet = register(
  key,
  // Handles base stats, core stats and Mindscapes 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...registerAllDmgDazeAndAnom(
    key,
    dm,
    // Basic Attack Chrysanthemum 1-2 hits are physical
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackChrysanthemumWheelDance',
      0,
      { damageType1: 'basic' },
      'atk'
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackChrysanthemumWheelDance',
      1,
      { damageType1: 'basic' },
      'atk'
    ),
    // Dash Attack is physical
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DashAttackMagneticWheelDance',
      0,
      { damageType1: 'dash' },
      'atk'
    ),
    // Per-hit buffs
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackFallingPetalsSlaughter',
      0,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ...ability_basic_dmg_,
      ...ability_basic_electric_resIgn_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackFallingPetalsDownfallFirstForm',
      0,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ...ability_basic_dmg_,
      ...ability_basic_electric_resIgn_,
      ...m1_basic_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackFallingPetalsDownfallSecondForm',
      0,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      ...ability_basic_dmg_,
      ...ability_basic_electric_resIgn_,
      ...m1_basic_crit_dmg_
    )
  ),

  ...customDmg(
    'm6_dmg',
    { damageType1: 'elemental' },
    cmpGE(char.mindscape, 6, prod(own.final.atk, percent(dm.m6.dmg)))
  ),

  // Buffs
  registerBuff(
    'core_atk',
    ownBuff.combat.atk.add(
      onslaught.ifOn(subscript(char.core, dm.core.onslaught_atk))
    )
  ),
  registerBuff(
    'core_crit_dmg_',
    ownBuff.combat.crit_dmg_.add(
      onslaught.ifOn(percent(subscript(char.core, dm.core.onslaught_crit_dmg_)))
    )
  ),
  registerBuff(
    'core_vanguard_atk',
    notOwnBuff.combat.atk.add(
      directStrike.ifOn(
        directStrikeCheck(subscript(char.core, dm.core.direct_strike_atk))
      )
    )
  ),
  registerBuff(
    'core_vanguard_crit_dmg_',
    notOwnBuff.combat.crit_dmg_.add(
      directStrike.ifOn(
        directStrikeCheck(
          percent(subscript(char.core, dm.core.direct_strike_crit_dmg_))
        )
      )
    )
  ),
  // Besiege DMG%: Seed (own) and Vanguard (notOwn), matching kit + M2 defIgn split.
  registerBuff(
    'core_dmg_',
    ownBuff.combat.common_dmg_.add(
      besiege(percent(subscript(char.core, dm.core.dmg_)))
    )
  ),
  registerBuff(
    'core_vanguard_dmg_',
    notOwnBuff.combat.common_dmg_.add(
      besiege(directStrikeCheck(percent(subscript(char.core, dm.core.dmg_))))
    )
  ),
  registerBuff(
    'ability_basic_dmg_',
    ability_basic_dmg_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'ability_basic_electric_resIgn_',
    ability_basic_electric_resIgn_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'ability_ult_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'ult',
      abilityCheck(percent(dm.ability.basic_ult_dmg_))
    )
  ),
  registerBuff(
    'ability_ult_electric_resIgn_',
    ownBuff.combat.resIgn_.electric.addWithDmgType(
      'ult',
      abilityCheck(percent(dm.ability.electric_resIgn_))
    )
  ),
  registerBuff(
    'm1_basic_crit_dmg_',
    m1_basic_crit_dmg_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'm2_defIgn_',
    ownBuff.combat.defIgn_.add(
      cmpGE(char.mindscape, 2, besiegeDisplay(percent(dm.m2.besiege_defIgn_)))
    )
  ),
  registerBuff(
    'm2_vanguard_defIgn_',
    notOwnBuff.combat.defIgn_.add(
      cmpGE(
        char.mindscape,
        2,
        besiegeDisplay(directStrikeCheck(percent(dm.m2.besiege_defIgn_)))
      )
    )
  ),
  registerBuff(
    'm2_basic_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'basic',
      cmpGE(
        char.mindscape,
        2,
        prod(energy_consumed, percent(dm.m2.basic_dmg_), percent(0.2))
      )
    )
  ),
  registerBuff(
    'm4_ult_dmg_',
    ownBuff.combat.dmg_.addWithDmgType(
      'ult',
      cmpGE(char.mindscape, 4, besiege(percent(dm.m4.ult_dmg_)))
    )
  ),
  registerBuff(
    'm6_crit_dmg_',
    ownBuff.combat.crit_dmg_.add(
      cmpGE(char.mindscape, 6, percent(dm.m6.crit_dmg_))
    )
  )
)
export default sheet
