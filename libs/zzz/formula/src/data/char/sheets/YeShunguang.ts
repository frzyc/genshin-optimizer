import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allStats, mappedStats } from '@genshin-optimizer/zzz/stats'
import {
  customDmg,
  own,
  ownBuff,
  percent,
  register,
  registerBuff,
} from '../../util'
import {
  dmgDazeAndAnomOverride,
  entriesForChar,
  getBaseTag,
  registerAllDmgDazeAndAnom,
} from '../util'

const key: CharacterKey = 'YeShunguang'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const core_veilVulnerabilityCap_ = ownBuff.combat.veilVulnerabilityCap_.add(
  percent(
    cmpGE(
      char.mindscape,
      4,
      dm.m4.vulnerabilityBonusCap_,
      dm.core.veilVulnerabilityCap_
    )
  )
)
const m2_exSpecial_defIgn_ = ownBuff.combat.defIgn_.addWithDmgType(
  'exSpecial',
  cmpGE(char.mindscape, 2, percent(dm.m2.defIgn_))
)
const m2_ult_defIgn_ = ownBuff.combat.defIgn_.addWithDmgType(
  'ult',
  cmpGE(char.mindscape, 2, percent(dm.m2.defIgn_))
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
      'BasicAttackEnlightenedMindSplittingCurrents',
      0,
      { ...baseTag, damageType1: 'basic', skillType1: 'basicSkill' },
      'atk',
      undefined,
      core_veilVulnerabilityCap_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackEnlightenedMindSplittingCurrents',
      1,
      { ...baseTag, damageType1: 'basic', skillType1: 'basicSkill' },
      'atk',
      undefined,
      core_veilVulnerabilityCap_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackEnlightenedMindSplittingCurrents',
      2,
      { ...baseTag, damageType1: 'basic', skillType1: 'basicSkill' },
      'atk',
      undefined,
      core_veilVulnerabilityCap_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackEnlightenedMindSkywardAscent',
      0,
      { ...baseTag, damageType1: 'basic', skillType1: 'basicSkill' },
      'atk',
      undefined,
      core_veilVulnerabilityCap_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackEnlightenedMindSunderlightMaximum',
      0,
      { ...baseTag, damageType1: 'basic', skillType1: 'basicSkill' },
      'atk',
      undefined,
      core_veilVulnerabilityCap_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackEnlightenedMindSunderlight',
      0,
      { ...baseTag, damageType1: 'basic', skillType1: 'basicSkill' },
      'atk',
      undefined,
      core_veilVulnerabilityCap_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackEnlightenedMindSunderlight',
      1,
      { ...baseTag, damageType1: 'basic', skillType1: 'basicSkill' },
      'atk',
      undefined,
      core_veilVulnerabilityCap_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackEnlightenedMindSunderlightAnnihilation',
      0,
      { ...baseTag, damageType1: 'basic', skillType1: 'basicSkill' },
      'atk',
      undefined,
      core_veilVulnerabilityCap_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'basic',
      'BasicAttackEnlightenedMindSunderlightAnnihilation',
      1,
      { ...baseTag, damageType1: 'basic', skillType1: 'basicSkill' },
      'atk',
      undefined,
      core_veilVulnerabilityCap_
    ),

    dmgDazeAndAnomOverride(
      dm,
      'assist',
      'QuickAssistEnlightenedMindTacticalSupport',
      0,
      { ...baseTag, damageType1: 'quickAssist', skillType1: 'assistSkill' },
      'atk',
      undefined,
      core_veilVulnerabilityCap_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'assist',
      'AssistFollowUpEnlightenedMindUnification',
      0,
      { ...baseTag, damageType1: 'assistFollowUp', skillType1: 'assistSkill' },
      'atk',
      undefined,
      core_veilVulnerabilityCap_
    ),

    dmgDazeAndAnomOverride(
      dm,
      'special',
      'SpecialAttackEnlightenedMindCleanExit',
      0,
      { ...baseTag, damageType1: 'special', skillType1: 'specialSkill' },
      'atk',
      undefined,
      core_veilVulnerabilityCap_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'EXSpecialAttackEnlightenedMindSoaringLight',
      0,
      { ...baseTag, damageType1: 'exSpecial', skillType1: 'specialSkill' },
      'atk',
      undefined,
      core_veilVulnerabilityCap_,
      ...m2_exSpecial_defIgn_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'special',
      'EXSpecialAttackEnlightenedMindReturnToDust',
      0,
      { ...baseTag, damageType1: 'exSpecial', skillType1: 'specialSkill' },
      'atk',
      undefined,
      core_veilVulnerabilityCap_
    ),

    dmgDazeAndAnomOverride(
      dm,
      'chain',
      'UltimateChasingStorms',
      0,
      { ...baseTag, damageType1: 'ult', skillType1: 'chainSkill' },
      'atk',
      undefined,
      core_veilVulnerabilityCap_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'chain',
      'ChainAttackEnlightenedMindLureThunder',
      0,
      { ...baseTag, damageType1: 'chain', skillType1: 'chainSkill' },
      'atk',
      undefined,
      core_veilVulnerabilityCap_
    ),
    dmgDazeAndAnomOverride(
      dm,
      'chain',
      'UltimateCleavingHeavens',
      0,
      { ...baseTag, damageType1: 'ult', skillType1: 'chainSkill' },
      'atk',
      undefined,
      core_veilVulnerabilityCap_,
      ...m2_ult_defIgn_
    )
  ),

  customDmg(
    'm6_dmg',
    { ...baseTag, damageType1: 'elemental' },
    cmpGE(char.mindscape, 6, prod(own.final.atk, percent(dm.m6.dmg)))
  ),

  // Buffs
  registerBuff(
    'core_veilVulnerabilityCap_',
    core_veilVulnerabilityCap_,
    undefined,
    undefined,
    false
  ),
  registerBuff(
    'core_crit_',
    ownBuff.combat.crit_.add(percent(subscript(char.core, dm.core.crit_)))
  ),
  registerBuff(
    'core_common_dmg_',
    ownBuff.combat.common_dmg_.add(
      percent(subscript(char.core, dm.core.common_dmg_))
    )
  ),
  registerBuff(
    'm1_common_dmg_',
    ownBuff.combat.common_dmg_.add(
      cmpGE(char.mindscape, 1, percent(dm.m1.common_dmg_))
    )
  ),
  registerBuff(
    'm1_defIgn_',
    ownBuff.combat.defIgn_.add(cmpGE(char.mindscape, 1, percent(dm.m1.defIgn_)))
  ),
  registerBuff(
    'm2_exSpecial_defIgn_',
    m2_exSpecial_defIgn_,
    undefined,
    undefined,
    false
  ),
  registerBuff('m2_ult_defIgn_', m2_ult_defIgn_, undefined, undefined, false)
)
export default sheet
