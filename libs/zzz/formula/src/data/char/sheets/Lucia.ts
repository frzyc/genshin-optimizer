import {
  cmpGE,
  constant,
  min,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  allBoolConditionals,
  customHeal,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
  registerBuffFormula,
  team,
  teamBuff,
} from '../../util'
import {
  dmgDazeAndAnomOverride,
  entriesForChar,
  getBaseTag,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'Lucia'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const { darkbreaker, etherVeil, dreamersNurseryRhyme } =
  allBoolConditionals(key)

const exSpecial_harmony_dmg_ = ownBuff.combat.flat_dmg.add(
  prod(own.final.hp, sum(percent(0.34), prod(char.special, percent(0.03))))
)
const m2_harmony_dmg_ = ownBuff.combat.common_dmg_.add(
  cmpGE(char.mindscape, 2, etherVeil.ifOn(percent(dm.m2.harmony_dmg_)))
)
const harmony_crit_ = ownBuff.combat.crit_.add(
  cmpGE(char.mindscape, 6, etherVeil.ifOn(percent(1)))
)
const harmony_crit_dmg_ = ownBuff.combat.crit_dmg_.add(
  cmpGE(char.mindscape, 6, etherVeil.ifOn(percent(dm.m6.harmony_crit_dmg_)))
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
      'BasicAttackOrbitalCombo',
      5,
      { ...baseTag, damageType1: 'basic' },
      'atk',
      undefined,
      exSpecial_harmony_dmg_,
      m2_harmony_dmg_,
      harmony_crit_,
      harmony_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackOrbitalCombo',
      6,
      { ...baseTag, damageType1: 'basic', damageType2: 'aftershock' },
      'atk',
      undefined,
      exSpecial_harmony_dmg_,
      m2_harmony_dmg_,
      harmony_crit_,
      harmony_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'dodge',
      'DodgeCounterStardustEcho',
      1,
      { ...baseTag, damageType1: 'dodgeCounter' },
      'atk',
      undefined,
      exSpecial_harmony_dmg_,
      m2_harmony_dmg_,
      harmony_crit_,
      harmony_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'SpecialAttackSymphonyOfTheReaperStorm',
      1,
      { ...baseTag, damageType1: 'special' },
      'atk',
      undefined,
      exSpecial_harmony_dmg_,
      m2_harmony_dmg_,
      harmony_crit_,
      harmony_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'SpecialAttackSymphonyOfTheReaperStorm',
      2,
      { ...baseTag, damageType1: 'special', damageType2: 'aftershock' },
      'atk',
      undefined,
      exSpecial_harmony_dmg_,
      m2_harmony_dmg_,
      harmony_crit_,
      harmony_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'EXSpecialAttackSymphonyOfTheReaperDaybreak',
      0,
      { ...baseTag, damageType1: 'exSpecial' },
      'atk',
      undefined,
      exSpecial_harmony_dmg_,
      m2_harmony_dmg_,
      harmony_crit_,
      harmony_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'assist',
      'QuickAssistCrushingMist',
      1,
      { ...baseTag, damageType1: 'quickAssist' },
      'atk',
      undefined,
      exSpecial_harmony_dmg_,
      m2_harmony_dmg_,
      harmony_crit_,
      harmony_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'assist',
      'QuickAssistCrushingMist',
      2,
      { ...baseTag, damageType1: 'quickAssist', damageType2: 'aftershock' },
      'atk',
      undefined,
      exSpecial_harmony_dmg_,
      m2_harmony_dmg_,
      harmony_crit_,
      harmony_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'assist',
      'AssistFollowUpHarmonyOfPaintedDreams',
      0,
      { ...baseTag, damageType1: 'assistFollowUp' },
      'atk',
      undefined,
      exSpecial_harmony_dmg_,
      m2_harmony_dmg_,
      harmony_crit_,
      harmony_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'chain',
      'ChainAttackStageOfBrilliance',
      0,
      { ...baseTag, damageType1: 'chain' },
      'atk',
      undefined,
      exSpecial_harmony_dmg_,
      m2_harmony_dmg_,
      harmony_crit_,
      harmony_crit_dmg_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'chain',
      'UltimateChargeGreatArmor',
      0,
      { ...baseTag, damageType1: 'ult' },
      'atk',
      undefined,
      exSpecial_harmony_dmg_,
      m2_harmony_dmg_,
      harmony_crit_,
      harmony_crit_dmg_
    )
  ),

  ...customHeal(
    'ult_heal',
    prod(own.final.hp, sum(percent(0.01), prod(char.chain, percent(0.0005))))
  ),

  // Buffs
  registerBuffFormula(
    'exSpecial_sheerForce',
    teamBuff.combat.sheerForce.add(
      darkbreaker.ifOn(
        min(
          sum(constant(612), prod(char.special, constant(24))),
          sum(
            constant(12),
            prod(
              own.initial.hp,
              constant(0.005),
              sum(constant(5), prod(char.special, constant(0.2)))
            )
          )
        )
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'exSpecial_harmony_dmg_',
    exSpecial_harmony_dmg_,
    undefined,
    false,
    false
  ),
  registerBuff(
    'core_hp_',
    teamBuff.combat.hp_.add(etherVeil.ifOn(percent(dm.core.hp_))),
    undefined,
    true
  ),
  registerBuff(
    'core_common_dmg_',
    teamBuff.combat.common_dmg_.add(
      dreamersNurseryRhyme.ifOn(
        percent(subscript(char.core, dm.core.common_dmg_))
      )
    )
  ),
  registerBuff(
    'ability_crit_dmg_',
    teamBuff.combat.crit_dmg_.add(
      cmpGE(
        sum(
          team.common.count.withSpecialty('rupture'),
          team.common.count.withSpecialty('stun')
        ),
        1,
        darkbreaker.ifOn(percent(dm.ability.crit_dmg_))
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'm1_resIgn_',
    teamBuff.combat.resIgn_.add(
      cmpGE(
        char.mindscape,
        1,
        dreamersNurseryRhyme.ifOn(percent(dm.m1.resIgn_))
      )
    ),
    undefined,
    true
  ),
  registerBuff('m2_harmony_dmg_', m2_harmony_dmg_, undefined, false, false),
  registerBuff(
    'm2_sheer_dmg_',
    teamBuff.combat.sheer_dmg_.add(
      cmpGE(
        char.mindscape,
        2,
        darkbreaker.ifOn(etherVeil.ifOn(percent(dm.m2.sheer_dmg_)))
      )
    ),
    undefined,
    true
  ),
  registerBuff(
    'm6_atk_',
    ownBuff.combat.atk.add(
      cmpGE(
        char.mindscape,
        6,
        etherVeil.ifOn(prod(own.initial.hp, percent(dm.m6.atk_)))
      )
    )
  ),
  registerBuff('m6_harmony_crit_', harmony_crit_, undefined, false, false),
  registerBuff(
    'm6_harmony_crit_dmg_',
    harmony_crit_dmg_,
    undefined,
    false,
    false
  )
)
export default sheet
